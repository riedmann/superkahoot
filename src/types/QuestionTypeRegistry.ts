import type { Question, TrueFalseQuestion, StandardQuestion } from "./question";
import React from "react";
import { ImagePasteField } from "../components/ImagePasteField";

export interface IQuestionHandler {
  type: string;
  label: string;
  createNew(): Question;
  getEditor(
    question: Question,
    onUpdate: (updates: Partial<Question>) => void
  ): React.ReactNode;
  getDisplay(question: Question): React.ReactNode;
}

export class QuestionTypeRegistry {
  private handlers = new Map<string, IQuestionHandler>();

  register(handler: IQuestionHandler): void {
    this.handlers.set(handler.type, handler);
  }

  getHandler(type: string): IQuestionHandler | undefined {
    return this.handlers.get(type);
  }

  getAvailableTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  getAvailableHandlers(): IQuestionHandler[] {
    return Array.from(this.handlers.values());
  }
}

// Question type handlers
export class TrueFalseQuestionHandler implements IQuestionHandler {
  type = "true-false";
  label = "True/False";

  createNew(): TrueFalseQuestion {
    return {
      id: `q${Date.now()}`,
      type: "true-false",
      question: "Enter question here",
      correctAnswer: true,
    };
  }

  getEditor(
    question: Question,
    onUpdate: (updates: Partial<Question>) => void
  ): React.ReactNode {
    const q = question as TrueFalseQuestion;
    return React.createElement(
      "div",
      { className: "space-y-4" },
      React.createElement(ImagePasteField, {
        value: q.question,
        onChange: (value: string) => onUpdate({ question: value }),
        placeholder: "Enter your true/false question here...",
        image: q.image,
        onImageChange: (imageData: string | undefined) =>
          onUpdate({ image: imageData }),
      }),
      React.createElement(
        "label",
        { className: "block text-sm font-medium text-gray-700 mb-2" },
        "Correct Answer"
      ),
      React.createElement(
        "div",
        { className: "flex gap-4" },
        React.createElement(
          "label",
          { className: "flex items-center gap-2" },
          React.createElement("input", {
            type: "radio",
            checked: q.correctAnswer === true,
            onChange: () => onUpdate({ correctAnswer: true }),
          }),
          React.createElement("span", {}, "True")
        ),
        React.createElement(
          "label",
          { className: "flex items-center gap-2" },
          React.createElement("input", {
            type: "radio",
            checked: q.correctAnswer === false,
            onChange: () => onUpdate({ correctAnswer: false }),
          }),
          React.createElement("span", {}, "False")
        )
      )
    );
  }

  getDisplay(question: Question): React.ReactNode {
    const q = question as TrueFalseQuestion;
    return React.createElement(
      "div",
      { className: "space-y-4" },
      q.image &&
        React.createElement("img", {
          src: q.image,
          alt: "Question image",
          className:
            "max-w-full max-h-64 rounded-lg border border-gray-200 mx-auto",
        }),
      React.createElement(
        "div",
        { className: "space-y-2" },
        React.createElement(
          "div",
          {
            className:
              "p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors",
          },
          "True"
        ),
        React.createElement(
          "div",
          {
            className:
              "p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors",
          },
          "False"
        )
      )
    );
  }
}

export class StandardQuestionHandler implements IQuestionHandler {
  type = "standard";
  label = "Multiple Choice";

  createNew(): StandardQuestion {
    return {
      id: `q${Date.now()}`,
      type: "standard",
      question: "Enter question here",
      options: [
        { text: "Option 1" },
        { text: "Option 2" },
        { text: "Option 3" },
        { text: "Option 4" },
      ],
      correctAnswers: [0],
    };
  }

  getEditor(
    question: Question,
    onUpdate: (updates: Partial<Question>) => void
  ): React.ReactNode {
    const q = question as StandardQuestion;
    return React.createElement(
      "div",
      { className: "space-y-4" },
      React.createElement(ImagePasteField, {
        value: q.question,
        onChange: (value: string) => onUpdate({ question: value }),
        placeholder: "Enter your multiple choice question here...",
        image: q.image,
        onImageChange: (imageData: string | undefined) =>
          onUpdate({ image: imageData }),
      }),
      React.createElement(
        "label",
        { className: "block text-sm font-medium text-gray-700 mb-2" },
        "Options"
      ),
      React.createElement(
        "div",
        { className: "space-y-4 mb-4" },
        ...q.options.map((option, optIdx) =>
          React.createElement(
            "div",
            { key: optIdx, className: "border border-gray-200 rounded-lg p-4" },
            React.createElement(
              "div",
              { className: "flex gap-2 items-center mb-2" },
              React.createElement("input", {
                type: "checkbox",
                checked: q.correctAnswers.includes(optIdx),
                onChange: (e) => {
                  const correctAnswers = q.correctAnswers;
                  if (e.target.checked) {
                    onUpdate({
                      correctAnswers: [...correctAnswers, optIdx],
                    });
                  } else {
                    onUpdate({
                      correctAnswers: correctAnswers.filter(
                        (i) => i !== optIdx
                      ),
                    });
                  }
                },
              }),
              React.createElement(
                "span",
                { className: "text-sm font-medium" },
                `Option ${optIdx + 1}`
              )
            ),
            React.createElement(ImagePasteField, {
              value: option.text,
              onChange: (value: string) => {
                const newOptions = [...q.options];
                newOptions[optIdx] = { ...newOptions[optIdx], text: value };
                onUpdate({ options: newOptions });
              },
              placeholder: `Enter option ${optIdx + 1}...`,
              image: option.image,
              onImageChange: (imageData: string | undefined) => {
                const newOptions = [...q.options];
                newOptions[optIdx] = {
                  ...newOptions[optIdx],
                  image: imageData,
                };
                onUpdate({ options: newOptions });
              },
            })
          )
        )
      ),
      React.createElement(
        "p",
        { className: "text-xs text-gray-600" },
        "Check the boxes for correct answers"
      )
    );
  }

  getDisplay(question: Question): React.ReactNode {
    const q = question as StandardQuestion;
    return React.createElement(
      "div",
      { className: "space-y-4" },
      q.image &&
        React.createElement("img", {
          src: q.image,
          alt: "Question image",
          className:
            "max-w-full max-h-64 rounded-lg border border-gray-200 mx-auto",
        }),
      React.createElement(
        "div",
        { className: "space-y-2" },
        ...q.options.map((option, index) =>
          React.createElement(
            "div",
            {
              key: index,
              className:
                "p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors",
            },
            React.createElement(
              "div",
              { className: "flex items-start gap-3" },
              React.createElement(
                "span",
                { className: "font-medium text-gray-700 mt-1" },
                String.fromCharCode(65 + index) + "."
              ),
              React.createElement(
                "div",
                { className: "flex-1" },
                option.text,
                option.image &&
                  React.createElement("img", {
                    src: option.image,
                    alt: `Option ${index + 1} image`,
                    className:
                      "mt-2 max-w-full max-h-32 rounded border border-gray-200",
                  })
              )
            )
          )
        )
      )
    );
  }
}

// Global registry instance
export const questionRegistry = new QuestionTypeRegistry();
questionRegistry.register(new TrueFalseQuestionHandler());
questionRegistry.register(new StandardQuestionHandler());
