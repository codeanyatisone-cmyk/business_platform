import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Employee, NewsItem, Anniversary, Event, Absence, TabType, Password, PasswordCategory, KnowledgeArticle, KnowledgeFolder, Course, Program, Transaction, Account, Company, Department } from '../types';

interface AppState {
  currentTab: TabType;
  currentCompanyId: number;
  companies: Company[];
  departments: Department[];
  employees: Employee[];
  news: NewsItem[];
  anniversaries: Anniversary[];
  events: Event[];
  absences: Absence[];
  passwords: Password[];
  passwordCategories: PasswordCategory[];
  knowledgeArticles: KnowledgeArticle[];
  knowledgeFolders: KnowledgeFolder[];
  courses: Course[];
  programs: Program[];
  transactions: Transaction[];
  accounts: Account[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_CURRENT_TAB'; payload: TabType }
  | { type: 'SET_CURRENT_COMPANY'; payload: number }
  | { type: 'SET_COMPANIES'; payload: Company[] }
  | { type: 'SET_DEPARTMENTS'; payload: Department[] }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'SET_NEWS'; payload: NewsItem[] }
  | { type: 'SET_ANNIVERSARIES'; payload: Anniversary[] }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'SET_ABSENCES'; payload: Absence[] }
  | { type: 'SET_PASSWORDS'; payload: Password[] }
  | { type: 'SET_PASSWORD_CATEGORIES'; payload: PasswordCategory[] }
  | { type: 'SET_KNOWLEDGE_ARTICLES'; payload: KnowledgeArticle[] }
  | { type: 'SET_KNOWLEDGE_FOLDERS'; payload: KnowledgeFolder[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NEWS'; payload: NewsItem }
  | { type: 'UPDATE_NEWS'; payload: NewsItem }
  | { type: 'DELETE_NEWS'; payload: number }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'ADD_ABSENCE'; payload: Absence }
  | { type: 'ADD_PASSWORD'; payload: Password }
  | { type: 'UPDATE_PASSWORD'; payload: Password }
  | { type: 'DELETE_PASSWORD'; payload: number }
  | { type: 'ADD_KNOWLEDGE_ARTICLE'; payload: KnowledgeArticle }
  | { type: 'UPDATE_KNOWLEDGE_ARTICLE'; payload: KnowledgeArticle }
  | { type: 'DELETE_KNOWLEDGE_ARTICLE'; payload: number }
  | { type: 'ADD_KNOWLEDGE_FOLDER'; payload: KnowledgeFolder }
  | { type: 'UPDATE_KNOWLEDGE_FOLDER'; payload: KnowledgeFolder }
  | { type: 'DELETE_KNOWLEDGE_FOLDER'; payload: number }
  | { type: 'INCREMENT_ARTICLE_VIEWS'; payload: number }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: number }
  | { type: 'SET_PROGRAMS'; payload: Program[] }
  | { type: 'ADD_PROGRAM'; payload: Program }
  | { type: 'UPDATE_PROGRAM'; payload: Program }
  | { type: 'DELETE_PROGRAM'; payload: number }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: number }
  | { type: 'UPDATE_ANNIVERSARY'; payload: Anniversary }
  | { type: 'DELETE_ANNIVERSARY'; payload: number }
  | { type: 'DELETE_EVENT'; payload: number }
  | { type: 'DELETE_ABSENCE'; payload: number }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: number }
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: number };

const initialState: AppState = {
  currentTab: 'news',
  currentCompanyId: 1, // Default company
  companies: [],
  departments: [],
  employees: [],
  news: [],
  anniversaries: [],
  events: [],
  absences: [],
  passwords: [],
  passwordCategories: [],
  knowledgeArticles: [],
  knowledgeFolders: [],
  courses: [],
  programs: [],
  transactions: [],
  accounts: [],
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_TAB':
      return { ...state, currentTab: action.payload };
    case 'SET_CURRENT_COMPANY':
      return { ...state, currentCompanyId: action.payload };
    case 'SET_COMPANIES':
      return { ...state, companies: action.payload };
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'SET_NEWS':
      return { ...state, news: action.payload };
    case 'SET_ANNIVERSARIES':
      return { ...state, anniversaries: action.payload };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'SET_ABSENCES':
      return { ...state, absences: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_NEWS':
      return { ...state, news: [action.payload, ...state.news] };
    case 'UPDATE_NEWS':
      return {
        ...state,
        news: state.news.map(news =>
          news.id === action.payload.id ? action.payload : news
        ),
      };
    case 'DELETE_NEWS':
      return {
        ...state,
        news: state.news.filter(news => news.id !== action.payload),
      };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'ADD_ABSENCE':
      return { ...state, absences: [...state.absences, action.payload] };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        ),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload),
      };
    case 'UPDATE_ANNIVERSARY':
      return {
        ...state,
        anniversaries: state.anniversaries.map(ann =>
          ann.id === action.payload.id ? action.payload : ann
        ),
      };
    case 'DELETE_ANNIVERSARY':
      return {
        ...state,
        anniversaries: state.anniversaries.filter(ann => ann.id !== action.payload),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
      };
    case 'DELETE_ABSENCE':
      return {
        ...state,
        absences: state.absences.filter(absence => absence.id !== action.payload),
      };
    case 'SET_PASSWORDS':
      return { ...state, passwords: action.payload };
    case 'SET_PASSWORD_CATEGORIES':
      return { ...state, passwordCategories: action.payload };
    case 'ADD_PASSWORD':
      return { ...state, passwords: [...state.passwords, action.payload] };
    case 'UPDATE_PASSWORD':
      return {
        ...state,
        passwords: state.passwords.map(pwd =>
          pwd.id === action.payload.id ? action.payload : pwd
        ),
      };
    case 'DELETE_PASSWORD':
      return {
        ...state,
        passwords: state.passwords.filter(pwd => pwd.id !== action.payload),
      };
    case 'SET_KNOWLEDGE_ARTICLES':
      return { ...state, knowledgeArticles: action.payload };
    case 'SET_KNOWLEDGE_FOLDERS':
      return { ...state, knowledgeFolders: action.payload };
    case 'ADD_KNOWLEDGE_ARTICLE':
      return { ...state, knowledgeArticles: [...state.knowledgeArticles, action.payload] };
    case 'UPDATE_KNOWLEDGE_ARTICLE':
      return {
        ...state,
        knowledgeArticles: state.knowledgeArticles.map(article =>
          article.id === action.payload.id ? action.payload : article
        ),
      };
    case 'DELETE_KNOWLEDGE_ARTICLE':
      return {
        ...state,
        knowledgeArticles: state.knowledgeArticles.filter(article => article.id !== action.payload),
      };
    case 'ADD_KNOWLEDGE_FOLDER':
      return { ...state, knowledgeFolders: [...state.knowledgeFolders, action.payload] };
    case 'UPDATE_KNOWLEDGE_FOLDER':
      return {
        ...state,
        knowledgeFolders: state.knowledgeFolders.map(folder =>
          folder.id === action.payload.id ? action.payload : folder
        ),
      };
    case 'DELETE_KNOWLEDGE_FOLDER':
      return {
        ...state,
        knowledgeFolders: state.knowledgeFolders.filter(folder => folder.id !== action.payload),
        knowledgeArticles: state.knowledgeArticles.filter(article => article.folderId !== action.payload),
      };
    case 'INCREMENT_ARTICLE_VIEWS':
      return {
        ...state,
        knowledgeArticles: state.knowledgeArticles.map(article =>
          article.id === action.payload ? { ...article, views: article.views + 1 } : article
        ),
      };
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.id ? action.payload : course
        ),
      };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => course.id !== action.payload),
      };
    case 'SET_PROGRAMS':
      return { ...state, programs: action.payload };
    case 'ADD_PROGRAM':
      return { ...state, programs: [...state.programs, action.payload] };
    case 'UPDATE_PROGRAM':
      return {
        ...state,
        programs: state.programs.map(program =>
          program.id === action.payload.id ? action.payload : program
        ),
      };
    case 'DELETE_PROGRAM':
      return {
        ...state,
        programs: state.programs.filter(program => program.id !== action.payload),
      };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload),
      };
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        ),
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}


