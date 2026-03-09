export type LectureContentBlock =
  | {
      id: string;
      type: "paragraph";
      text: string;
    }
  | {
      id: string;
      type: "formula";
      latex: string;
      description?: string;
    }
  | {
      id: string;
      type: "note";
      title: string;
      text: string;
    }
  | {
      id: string;
      type: "checklist";
      title: string;
      items: string[];
    }
  | {
      id: string;
      type: "selfCheck";
      title: string;
      question: string;
      options: {
        id: string;
        text: string;
      }[];
      correctOptionId: string;
      explanation?: string;
    };

const lectureContentByTitle: Record<string, LectureContentBlock[]> = {
  "Предел функции": [
    {
      id: "limit-paragraph-1",
      type: "paragraph",
      text:
        "Предел функции описывает поведение значений функции при приближении аргумента к некоторой точке. Нас интересует не только значение в самой точке, а то, к чему стремится функция рядом с ней.",
    },
    {
      id: "limit-formula-1",
      type: "formula",
      latex: "lim_{x \\to a} f(x) = L",
      description:
        "Если при x, стремящемся к a, значения f(x) стремятся к L, то L называется пределом функции в точке a.",
    },
    {
      id: "limit-note-1",
      type: "note",
      title: "Важно",
      text:
        "Функция может иметь предел в точке, даже если она не определена в самой точке или её значение в точке отличается от предела.",
    },
    {
      id: "limit-checklist-1",
      type: "checklist",
      title: "Что проверить при решении",
      items: [
        "К какой точке стремится аргумент",
        "Есть ли подстановка без неопределённости",
        "Можно ли упростить выражение",
        "Нужно ли рассмотреть односторонние пределы",
      ],
    },
    {
      id: "limit-selfcheck-1",
      type: "selfCheck",
      title: "Мини-проверка",
      question:
        "Что означает запись lim(x→a) f(x) = L?",
      options: [
        {
          id: "limit-option-1",
          text: "Функция обязательно равна L в точке a",
        },
        {
          id: "limit-option-2",
          text: "Значения функции стремятся к L при приближении x к a",
        },
        {
          id: "limit-option-3",
          text: "Аргумент всегда равен L",
        },
      ],
      correctOptionId: "limit-option-2",
      explanation:
        "Предел описывает поведение функции возле точки. Значение функции в самой точке может быть другим или вообще отсутствовать.",
    },
  ],
  "Производная": [
    {
      id: "derivative-paragraph-1",
      type: "paragraph",
      text:
        "Производная показывает скорость изменения функции. Геометрически это тангенс угла наклона касательной к графику функции в точке.",
    },
    {
      id: "derivative-formula-1",
      type: "formula",
      latex: "f'(x) = lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}",
      description:
        "Это определение производной через предел приращения функции к приращению аргумента.",
    },
    {
      id: "derivative-note-1",
      type: "note",
      title: "Где применяется",
      text:
        "Производная используется для исследования функции, нахождения экстремумов, скорости изменения, касательных и оптимизационных задач.",
    },
    {
      id: "derivative-checklist-1",
      type: "checklist",
      title: "Базовые шаги",
      items: [
        "Найти производную по правилам дифференцирования",
        "Упростить выражение",
        "Подставить нужную точку, если требуется",
        "Сделать вывод по знаку или значению производной",
      ],
    },
    {
      id: "derivative-selfcheck-1",
      type: "selfCheck",
      title: "Мини-проверка",
      question:
        "Что геометрически означает производная функции в точке?",
      options: [
        {
          id: "derivative-option-1",
          text: "Площадь под графиком функции",
        },
        {
          id: "derivative-option-2",
          text: "Тангенс угла наклона касательной к графику",
        },
        {
          id: "derivative-option-3",
          text: "Точку пересечения с осью OY",
        },
      ],
      correctOptionId: "derivative-option-2",
      explanation:
        "Производная в точке показывает наклон касательной и отражает скорость изменения функции.",
    },
  ],
};

const defaultLectureContent: LectureContentBlock[] = [
  {
    id: "default-paragraph-1",
    type: "paragraph",
    text:
      "Для этой лекции расширенный контент пока не заполнен. Позже здесь можно будет показывать теорию, формулы, изображения и проверочные блоки.",
  },
  {
    id: "default-checklist-1",
    type: "checklist",
    title: "Что можно добавить дальше",
    items: [
      "Теоретические абзацы",
      "Формулы",
      "Иллюстрации и графики",
      "Вопросы для самопроверки",
    ],
  },
  {
    id: "default-selfcheck-1",
    type: "selfCheck",
    title: "Демо-проверка",
    question: "Какой тип блока мы только что добавили в приложение?",
    options: [
      {
        id: "default-option-1",
        text: "Только картинку",
      },
      {
        id: "default-option-2",
        text: "Мини-проверку с выбором ответа",
      },
      {
        id: "default-option-3",
        text: "Только таймер",
      },
    ],
    correctOptionId: "default-option-2",
    explanation:
      "Теперь внутри лекции можно показывать мини-проверки с вариантами ответа и простым результатом.",
  },
];

function normalizeTitle(title: string): string {
  return title.trim();
}

export function getLectureContentByTitle(title: string): LectureContentBlock[] {
  const normalizedTitle = normalizeTitle(title);

  return lectureContentByTitle[normalizedTitle] ?? defaultLectureContent;
}