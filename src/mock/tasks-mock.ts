import {Task} from "../components/tasks-page/table-component.tsx";
import {Sprint} from "../components/tasks-page/tasks-info-component.tsx";

export const sprintMock: Sprint = {
    id: 1,
    tasks: 7,
    inProgress: 7,
    done: 0,
}

export const tasksMock:Task[] = [
    {
        id: '#123',
        task: 'Создать страницу входа',
        deadline: '22.03',
        roles: 'Фронтенд',
        priority: 'Средний',
        tracker: 50,
        userAvatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
        id: '#124',
        task: 'Реализовать страницу входа',
        deadline: '20.03',
        roles: 'Дизайнер',
        priority: 'Высокий',
        tracker: 30,
        userAvatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
        id: '#125',
        task: 'Написание модульных тестов',
        deadline: '21.03',
        roles: 'Тестировщик',
        priority: 'Низкий',
        tracker: 20,
        userAvatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
        id: '#126',
        task: 'Исправить подключение к бд',
        deadline: '22.03',
        roles: 'Бэкэнд',
        priority: 'Средний',
        tracker: 40,
    },
    {
        id: '#127',
        task: 'Развертывание на сервере',
        deadline: '23.03',
        roles: 'DevOps',
        priority: 'Высокий',
        tracker: 60,
        userAvatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
        id: '#128',
        task: 'Обновление документации',
        deadline: '21.03',
        roles: 'Аналитик',
        priority: 'Низкий',
        tracker: 10,
        userAvatar: 'https://i.pravatar.cc/150?img=6',
    },
    {
        id: '#129',
        task: 'Сократить время на внедрение функций',
        deadline: '21.03',
        roles: 'Менеджер',
        priority: 'Средний',
        tracker: 70,
    },
]
