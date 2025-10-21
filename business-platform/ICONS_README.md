# 🎨 Замена логотипа и иконок

## Текущее состояние

✅ **SVG логотип** уже создан и используется в современных браузерах
- Файл: `public/logo.svg`
- Автоматически используется как favicon в Chrome, Firefox, Safari

## Как сгенерировать PNG иконки

### Вариант 1: Использовать HTML генератор (самый простой)

1. Откройте файл `icon-generator.html` в браузере (уже открыт)
2. Вы увидите предпросмотр всех иконок
3. Нажмите кнопки для скачивания:
   - **favicon.ico** (32x32)
   - **logo192.png** (192x192)
   - **logo512.png** (512x512)
4. Сохраните скачанные файлы в папку `public/`
5. Пересоберите проект: `npm run build`
6. Задеплойте: `./deploy.sh`

### Вариант 2: Онлайн конвертер

1. Перейдите на https://cloudconvert.com/svg-to-png
2. Загрузите файл `public/logo.svg`
3. Конвертируйте в нужные размеры:
   - 32x32 → `favicon.ico`
   - 192x192 → `logo192.png`
   - 512x512 → `logo512.png`
4. Сохраните в папку `public/`

### Вариант 3: Использовать ImageMagick (если установлен)

```bash
# Установка ImageMagick
brew install imagemagick  # macOS
# или
sudo apt install imagemagick  # Ubuntu/Debian

# Генерация иконок
cd public
convert logo.svg -resize 32x32 favicon.ico
convert logo.svg -resize 192x192 logo192.png
convert logo.svg -resize 512x512 logo512.png
```

## Что уже настроено

✅ Название на вкладке: **"Business Platform | TKO"**
✅ SVG иконка для современных браузеров
✅ Описание сайта обновлено
✅ Цветовая тема (розовый-синий градиент)
✅ Manifest.json настроен для PWA

## Дизайн логотипа

Логотип включает:
- 🎨 Градиент: розовый (#ec4899) → синий (#3b82f6)
- 📝 Текст "TKO" белым цветом
- 💼 Иконка портфеля/бизнеса
- 🔘 Скругленные углы (border-radius: 100px)

## Проверка

После замены иконок откройте:
- https://anyatis.com
- Очистите кеш браузера (Ctrl+Shift+R)
- Проверьте favicon на вкладке

## Файлы для замены

```
public/
├── favicon.ico      ← Скачать из icon-generator.html
├── logo192.png      ← Скачать из icon-generator.html
├── logo512.png      ← Скачать из icon-generator.html
└── logo.svg         ✅ Уже создан и настроен
```

---

**💡 Совет:** Современные браузеры (Chrome 80+, Firefox 41+, Safari 9+) поддерживают SVG favicon, поэтому `logo.svg` уже работает! PNG файлы нужны только для старых браузеров и PWA.

