"""
Email service для работы с IMAP/SMTP
"""

import imaplib
import smtplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import decode_header
from typing import List, Dict, Optional
from datetime import datetime
import os
import re


class EmailService:
    """Сервис для работы с почтой через IMAP/SMTP"""
    
    def __init__(self, email_address: str, password: str):
        self.email_address = email_address
        self.password = password
        self.imap_server = os.getenv("MAILCOW_IMAP_SERVER", "mail.anyatis.com")
        self.smtp_server = os.getenv("MAILCOW_SMTP_SERVER", "mail.anyatis.com")
        self.imap_port = int(os.getenv("MAILCOW_IMAP_PORT", "993"))
        self.smtp_port = int(os.getenv("MAILCOW_SMTP_PORT", "587"))
    
    def _decode_header_value(self, value: str) -> str:
        """Декодирование заголовка письма"""
        if not value:
            return ""
        
        decoded_parts = decode_header(value)
        result = []
        
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                if encoding:
                    try:
                        result.append(part.decode(encoding))
                    except:
                        result.append(part.decode('utf-8', errors='ignore'))
                else:
                    result.append(part.decode('utf-8', errors='ignore'))
            else:
                result.append(str(part))
        
        return ''.join(result)
    
    def _clean_email_address(self, email_str: str) -> str:
        """Извлечение чистого email адреса"""
        match = re.search(r'<(.+?)>', email_str)
        if match:
            return match.group(1)
        return email_str.strip()
    
    def connect_imap(self) -> imaplib.IMAP4_SSL:
        """Подключение к IMAP серверу"""
        try:
            mail = imaplib.IMAP4_SSL(self.imap_server, self.imap_port)
            mail.login(self.email_address, self.password)
            return mail
        except Exception as e:
            raise Exception(f"Failed to connect to IMAP: {str(e)}")
    
    def get_folders(self) -> List[Dict[str, str]]:
        """Получение списка папок"""
        try:
            mail = self.connect_imap()
            status, folders = mail.list()
            mail.logout()
            
            folder_list = []
            if status == 'OK':
                for folder in folders:
                    folder_str = folder.decode() if isinstance(folder, bytes) else str(folder)
                    # Парсинг формата: (flags) "delimiter" "name"
                    parts = folder_str.split('"')
                    if len(parts) >= 3:
                        folder_name = parts[-2]
                        folder_list.append({
                            "name": folder_name,
                            "display_name": folder_name.replace("INBOX.", "")
                        })
            
            return folder_list
        except Exception as e:
            raise Exception(f"Failed to get folders: {str(e)}")
    
    def get_emails(
        self, 
        folder: str = "INBOX", 
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict]:
        """Получение списка писем из папки"""
        try:
            mail = self.connect_imap()
            mail.select(folder, readonly=True)
            
            # Поиск всех писем
            status, messages = mail.search(None, 'ALL')
            
            if status != 'OK':
                mail.logout()
                return []
            
            email_ids = messages[0].split()
            email_ids.reverse()  # Новые письма сначала
            
            # Применяем пагинацию
            start = offset
            end = min(offset + limit, len(email_ids))
            email_ids = email_ids[start:end]
            
            emails = []
            
            for email_id in email_ids:
                try:
                    status, msg_data = mail.fetch(email_id, '(RFC822)')
                    
                    if status != 'OK':
                        continue
                    
                    for response_part in msg_data:
                        if isinstance(response_part, tuple):
                            msg = email.message_from_bytes(response_part[1])
                            
                            # Извлечение заголовков
                            subject = self._decode_header_value(msg.get('Subject', ''))
                            from_addr = self._decode_header_value(msg.get('From', ''))
                            to_addr = self._decode_header_value(msg.get('To', ''))
                            date_str = msg.get('Date', '')
                            
                            # Извлечение тела письма
                            body = ""
                            if msg.is_multipart():
                                for part in msg.walk():
                                    content_type = part.get_content_type()
                                    if content_type == "text/plain":
                                        try:
                                            body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                            break
                                        except:
                                            pass
                                    elif content_type == "text/html" and not body:
                                        try:
                                            body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                        except:
                                            pass
                            else:
                                try:
                                    body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                                except:
                                    body = str(msg.get_payload())
                            
                            # Ограничение длины превью
                            preview = body[:200] + "..." if len(body) > 200 else body
                            
                            emails.append({
                                "id": email_id.decode(),
                                "subject": subject,
                                "from": from_addr,
                                "to": to_addr,
                                "date": date_str,
                                "preview": preview,
                                "has_attachments": self._has_attachments(msg)
                            })
                except Exception as e:
                    print(f"Error processing email {email_id}: {str(e)}")
                    continue
            
            mail.logout()
            return emails
            
        except Exception as e:
            raise Exception(f"Failed to get emails: {str(e)}")
    
    def _has_attachments(self, msg) -> bool:
        """Проверка наличия вложений"""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_disposition() == 'attachment':
                    return True
        return False
    
    def get_email_by_id(self, email_id: str, folder: str = "INBOX") -> Optional[Dict]:
        """Получение полного содержимого письма по ID"""
        try:
            mail = self.connect_imap()
            mail.select(folder, readonly=True)
            
            status, msg_data = mail.fetch(email_id.encode(), '(RFC822)')
            
            if status != 'OK':
                mail.logout()
                return None
            
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    
                    # Извлечение заголовков
                    subject = self._decode_header_value(msg.get('Subject', ''))
                    from_addr = self._decode_header_value(msg.get('From', ''))
                    to_addr = self._decode_header_value(msg.get('To', ''))
                    cc_addr = self._decode_header_value(msg.get('Cc', ''))
                    date_str = msg.get('Date', '')
                    
                    # Извлечение тела письма
                    body_plain = ""
                    body_html = ""
                    attachments = []
                    
                    if msg.is_multipart():
                        for part in msg.walk():
                            content_type = part.get_content_type()
                            content_disposition = part.get_content_disposition()
                            
                            if content_disposition == 'attachment':
                                filename = part.get_filename()
                                if filename:
                                    attachments.append({
                                        "filename": self._decode_header_value(filename),
                                        "size": len(part.get_payload(decode=True) or b'')
                                    })
                            elif content_type == "text/plain":
                                try:
                                    body_plain = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                except:
                                    pass
                            elif content_type == "text/html":
                                try:
                                    body_html = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                except:
                                    pass
                    else:
                        try:
                            body_plain = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                        except:
                            body_plain = str(msg.get_payload())
                    
                    mail.logout()
                    
                    return {
                        "id": email_id,
                        "subject": subject,
                        "from": from_addr,
                        "to": to_addr,
                        "cc": cc_addr,
                        "date": date_str,
                        "body_plain": body_plain,
                        "body_html": body_html,
                        "attachments": attachments
                    }
            
            mail.logout()
            return None
            
        except Exception as e:
            raise Exception(f"Failed to get email: {str(e)}")
    
    def send_email(
        self,
        to: str,
        subject: str,
        body: str,
        cc: Optional[str] = None,
        bcc: Optional[str] = None,
        is_html: bool = False
    ) -> bool:
        """Отправка письма через SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.email_address
            msg['To'] = to
            msg['Subject'] = subject
            
            if cc:
                msg['Cc'] = cc
            if bcc:
                msg['Bcc'] = bcc
            
            # Добавление тела письма
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            # Подключение к SMTP и отправка
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_address, self.password)
                
                recipients = [to]
                if cc:
                    recipients.extend([addr.strip() for addr in cc.split(',')])
                if bcc:
                    recipients.extend([addr.strip() for addr in bcc.split(',')])
                
                server.sendmail(self.email_address, recipients, msg.as_string())
            
            return True
            
        except Exception as e:
            raise Exception(f"Failed to send email: {str(e)}")
    
    def delete_email(self, email_id: str, folder: str = "INBOX") -> bool:
        """Удаление письма (перемещение в корзину)"""
        try:
            mail = self.connect_imap()
            mail.select(folder)
            
            # Пометка письма как удаленного
            mail.store(email_id.encode(), '+FLAGS', '\\Deleted')
            
            # Применение изменений
            mail.expunge()
            
            mail.logout()
            return True
            
        except Exception as e:
            raise Exception(f"Failed to delete email: {str(e)}")
    
    def mark_as_read(self, email_id: str, folder: str = "INBOX") -> bool:
        """Пометка письма как прочитанного"""
        try:
            mail = self.connect_imap()
            mail.select(folder)
            
            mail.store(email_id.encode(), '+FLAGS', '\\Seen')
            
            mail.logout()
            return True
            
        except Exception as e:
            raise Exception(f"Failed to mark email as read: {str(e)}")


