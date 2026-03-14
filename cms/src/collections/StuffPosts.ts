import { CollectionConfig } from "payload";

const StuffPosts: CollectionConfig = {
  slug: "stuff-posts",

  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "tag", "order", "published", "updatedAt"],
    description:
      'Cards shown in the "Stuff we’ve done" section on the homepage.',
  },

  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },

  fields: [
    {
      name: "tag",
      label: "Tag",
      type: "text",
      required: true,
      admin: {
        description:
          'Small pill label shown at the top. Example: "Black Friday 2018".',
      },
    },

    {
      name: "label",
      label: "Headline",
      type: "text",
      required: true,
      admin: {
        description:
          'Main headline text. Example: "Holy fuck we had some deals."',
      },
    },

    {
      name: "image",
      label: "Illustration",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "Square illustration (1080×1080 recommended). Appears floating on the card.",
      },
    },

    {
      name: "href",
      label: "Link",
      type: "text",
      defaultValue: "#",
      admin: {
        description:
          "Where the card links when clicked. Example: /blog/black-friday",
      },
    },

    {
      name: "cta",
      label: "CTA Label",
      type: "select",
      defaultValue: "Read",
      options: [
        { label: "Read", value: "Read" },
        { label: "Watch", value: "Watch" },
        { label: "Listen", value: "Listen" },
        { label: "Play", value: "Play" },
      ],
      admin: {
        description: "Label shown beside the arrow button.",
      },
    },

    {
      name: "backgroundColor",
      label: "Background Color",
      type: "text",
      defaultValue: "#ffffff",
      admin: {
        description:
          "Card background color (hex). Example: #fffe5b, #ede5ff, #1b5bff",
      },
    },

    {
      name: "textColor",
      label: "Text Color",
      type: "text",
      defaultValue: "#000000",
      admin: {
        description:
          "Main headline text color. Example: #fe2f2f, #7333f1, #d7b73b",
      },
    },

    {
      name: "tagBg",
      label: "Tag Background Color",
      type: "text",
      defaultValue: "#000000",
      admin: {
        description: "Background color of the tag pill.",
      },
    },

    {
      name: "tagColor",
      label: "Tag Text Color",
      type: "text",
      defaultValue: "#ffffff",
      admin: {
        description: "Text color inside the tag pill.",
      },
    },

    {
      name: "order",
      label: "Order",
      type: "number",
      defaultValue: 99,
      admin: {
        description:
          "Display order. Lower numbers appear first. Use 10, 20, 30...",
      },
    },

    {
      name: "published",
      label: "Published",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description:
          "Uncheck to hide this card without deleting it.",
      },
    },
  ],
};

export default StuffPosts;