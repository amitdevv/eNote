import { Node, mergeAttributes } from '@tiptap/core';

export interface IframeOptions {
  allowFullScreen: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string; width?: number; height?: number }) => ReturnType;
    };
  }
}

export const Iframe = Node.create<IframeOptions>({
  name: 'iframe',

  addOptions() {
    return {
      allowFullScreen: true,
      HTMLAttributes: {
        class: 'iframe-embed',
      },
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 640,
      },
      height: {
        default: 360,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, { class: 'iframe-wrapper' }),
      [
        'iframe',
        mergeAttributes(HTMLAttributes, {
          frameBorder: 0,
          allowFullScreen: this.options.allowFullScreen ? 'true' : 'false',
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setIframe:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default Iframe; 