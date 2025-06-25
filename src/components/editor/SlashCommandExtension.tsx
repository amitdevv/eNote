import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SlashCommand, SlashCommandRef } from './SlashCommand';
import React from 'react';

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        items: () => {
          return [];
        },
        render: () => {
          let component: React.RefObject<SlashCommandRef>;
          let popup: any;

          return {
            onStart: () => {
              component = React.createRef();
              
              // Simplified popup creation
              popup = [{ 
                hide: () => {}, 
                destroy: () => {},
                setProps: () => {}
              }];
            },

            onUpdate() {
              // Simplified update
            },

            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }

              if (component.current) {
                return component.current.onKeyDown(props);
              }

              return false;
            },

            onExit() {
              popup[0].destroy();
            },
          };
        },

        command: ({ editor, range }: { editor: any; range: any }) => {
          editor.chain().focus().deleteRange(range).run();
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: () => {
          return [
            {
              title: 'Continue with slash commands...',
              command: () => {
                // This will be handled by the SlashCommand component
              },
            },
          ];
        },
        render: () => {
          let component: ReactRenderer | null = null;
          let popup: TippyInstance[] = [];

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashCommand, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate(props: any) {
              if (component) {
                component.updateProps(props);
              }

              if (!props.clientRect || popup.length === 0) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                if (popup.length > 0 && popup[0]) {
                  popup[0].hide();
                }
                return true;
              }

              if (component && component.ref) {
                const commandRef = component.ref as SlashCommandRef;
                return commandRef?.onKeyDown(props.event);
              }

              return false;
            },

            onExit() {
              if (popup.length > 0 && popup[0]) {
                popup[0].destroy();
              }
              if (component) {
                component.destroy();
              }
              popup = [];
              component = null;
            },
          };
        },
      }),
    ];
  },
}); 