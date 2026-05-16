import { Task } from "../pages/board-page.tsx";

export const mockTasks: Task[] = [
    {
        id: '1',
        userName: 'Иван Иванов',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        description: 'Реализовать авторизацию пользователей',
        date: '2023-10-15',
        category: 'todo'
    },
    {
        id: '2',
        userName: 'Петр Петров',
        userAvatar: 'https://i.pravatar.cc/150?img=2',
        description: 'Создать компонент навигации',
        date: '2023-10-16',
        category: 'in-progress'
    },
    {
        id: '3',
        userName: 'Анна Сидорова',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        description: 'Разработать архитектуру БД',
        date: '2023-10-17',
        category: 'epics'
    },
    {
        id: '4',
        userName: 'Мария Кузнецова',
        description: 'Написать тесты для API',
        date: '2023-10-14',
        category: 'done'
    },
    {
        id: '5',
        userName: 'Алексей Смирнов',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        description: 'Оптимизировать загрузку изображений',
        date: '2023-10-18',
        category: 'todo'
    },
    {
        id: '6',
        userName: 'Елена Васильева',
        userAvatar: 'https://i.pravatar.cc/150?img=6',
        description: 'Рефакторинг кода',
        date: '2023-10-13',
        category: 'done'
    },
    {
        id: '7',
        userName: 'Дмитрий Попов',
        description: 'Интеграция с платежной системой',
        date: '2023-10-19',
        category: 'epics'
    },
    {
        id: '8',
        userName: 'Ольга Федорова',
        userAvatar: 'https://i.pravatar.cc/150?img=8',
        description: 'Добавить темную тему',
        date: '2023-10-20',
        category: 'in-progress'
    }
];
