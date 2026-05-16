/**
 * Форматирует дату в формат 'D MMM' (например: '16 окт')
 * @param dateString - Дата в любом ISO-формате (например: '2025-05-19T12:59:08.502Z')
 * @returns Отформатированная дата в виде 'D MMM'
 */
export const formatDateToDayMonth = (dateString: string): string => {
    const date = new Date(dateString);

    // Проверка на валидность объекта Date
    if (isNaN(date.getTime())) {
        throw new Error('Передана некорректная дата');
    }

    const day = date.getDate();
    const month = date.toLocaleString('ru-RU', { month: 'short' }).replace('.', '');

    return `${day} ${month}`;
};

export const getTaskPriorityColor = (priority: number): string => {
    switch (priority) {
        case 0:
            return '#8ed380';
        case 1:
            return '#136a00';
        case 2:
            return '#b18403';
        case 3:
            return '#aa1515';
        case 4:
            return '#870000';
        default:
            return 'none';
    }
};

export const rebuildFilePath = (filePath: string, fileTypeId: number): string => {
    if (!filePath?.trim()) return '';

    const fileTypes = {
        0: 'avatars',
        1: 'documents',
        2: 'attachments',
        3: '',
    } as const;

    const type = fileTypes[fileTypeId as keyof typeof fileTypes];
    const normalizedPath = filePath.replace(/^\/+/, '');

    return `/api/${type}/${normalizedPath}`;
};

export const calculateTimeLeft = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Если дедлайн уже прошел
    if (now > end) {
        const overdue = now.getTime() - end.getTime();
        const overdueDays = Math.floor(overdue / (1000 * 60 * 60 * 24));
        const overdueHours = Math.floor((overdue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        let overdueText = "Просрочено на ";
        if (overdueDays > 0) {
            overdueText += `${overdueDays} дн.`;
        } else {
            overdueText += `${Math.round(overdueHours)} ч.`;
        }

        return {
            text: overdueText,
            percentage: 100,
            isOverdue: true,
            overdueDays,
            overdueHours
        };
    }

    // Если задача еще не началась
    if (now < start) {
        return {
            text: "Не начата",
            percentage: 0,
            isOverdue: false,
            overdueDays: 0,
            overdueHours: 0
        };
    }

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const remaining = end.getTime() - now.getTime();

    const percentage = Math.min(100, Math.round((elapsed / totalDuration) * 100));

    // Рассчитываем оставшееся время
    const daysLeft = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let timeLeftText = "";
    if (daysLeft > 0) {
        timeLeftText = `${daysLeft} дн.`;
    } else {
        timeLeftText = `${Math.round(hoursLeft)} ч.`;
    }

    return {
        text: timeLeftText,
        percentage,
        isOverdue: false,
        overdueDays: 0,
        overdueHours: 0
    };
};

export const declinateTaskWord = (count: number) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'задач';
    }

    switch (lastDigit) {
        case 1: return 'задача';
        case 2:
        case 3:
        case 4: return 'задачи';
        default: return 'задач';
    }
};
