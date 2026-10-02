# Display Components

> Community guide for `None` (none) — package **ForgeScript**. Approved 2025-12-17. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-259)

Display Components (Components V2) allow you to create messages with various layout and content options. This provides you with more flexibility in designing and formatting your app's messages beyond simple text or embeds.

> [!NOTE]
> You cannot include regular message content, embeds, stickers, or polls when using display components.

## Table of Contents

1. [Text Display](#text-display-2)
2. [Section](#section-4)
3. [Media Gallery](#media-gallery-9)
4. [File](#file-11)
5. [Separator](#separator-13)
6. [Container](#container-15)

---

## Text Display

Text Display components add simple text with Markdown formatting support to your message. Total text across all such components must not exceed **4,000** characters. Use [`$addTextDisplay[]`](https://docs.botforge.org/function/$addTextDisplay) to create a new Text Display component.

> [!TIP]
> Text Display components can also be used in modals.

### Example
```fs
$addTextDisplay[This is a **Text Display** component!]
```

<img src="https://i.imgur.com/9ZPVDbY.png" draggable=false>

---

## Section

Sections group up to three [Text Display](#text-display-2) components and require an accessory. The accessory must either be a [Thumbnail](#thumbnail-accessory-5) or [Button](#button-accessory-7) component. At least one Text Display component is required. Use [`$addSection[]`](https://docs.botforge.org/function/$addSection) to create a new Section component.

> [!TIP]
> If you do not want to include an accessory, use a [Text Display](#text-display-2) component instead.

### Thumbnail Accessory

A Thumbnail component is visually similar to embed thumbnails. It can exclusively be added as accessory inside a [Section](#section-4) component, supports alt text (description) and can be marked as a spoiler. Use [`$addThumbnail[]`](https://docs.botforge.org/function/$addThumbnail) to create a new Thumbnail component.

#### Example
```fs
$addSection[
  $addTextDisplay[This is a **Text Display** component inside a **Section** component with **Thumbnail** accessory!]
  $addThumbnail[$userAvatar[$botID]]
]
```

<img src="https://i.imgur.com/JZ5bpxE.png" draggable=false>

### Button Accessory

A Button is an interactive message component. It can be added as single accessory inside a [Section](#section-4) component and does not need to be grouped in an action row. Use [`$addButton[]`](https://docs.botforge.org/function/$addButton) to create a new Button component.

#### Example
```fs
$addSection[
  $addTextDisplay[This is a **Text Display** component inside a **Section** component!]
  $addTextDisplay[It has an interactive **Button** accessory attached!]
  $addButton[click;Click Me;Primary]
]
```

<img src="https://i.imgur.com/w9oFqRY.png" draggable=false>

---

## Media Gallery

The Media Gallery allows to display a grid of up to 10 media items, similar to attachments. Each media item can either be an image, video, or GIF, with optional alt text (description) and the option to mark it as a spoiler. Use [`$addMediaGallery[]`](https://docs.botforge.org/function/$addMediaGallery) and [`$addMediaItem[]`](https://docs.botforge.org/function/$addMediaItem) to create a new Media Gallery component with one or multiple media items.

### Example
```fs
$addMediaGallery[
  $addMediaItem[$userAvatar[$botID]]
  $addMediaItem[$guildIcon;Server Icon as Spoiler;true]
]
```

<img src="https://i.imgur.com/AARpuPO.png" draggable=false>

---

## File

File components embed a single file in the message body. They don’t support alt text (description) but can be marked as spoilers. Adding files requires using [`$attachment[]`](https://docs.botforge.org/function/$attachment) along with the `attachment://` format. Use [`$addFile[]`](https://docs.botforge.org/function/$addFile) to create a new File component.

### Example
```fs
$attachment[data/example.json;file.json]
$addFile[attachment://file.json]
```

<img src="https://i.imgur.com/aBo5egA.png" draggable=false>

---

## Separator

Separators are display components that insert vertical spacing and an optional visual divider line between components. You can choose the spacing size (`Small` or `Large`) for the Separator component, as well as whether to display the divider line (defaults to `true`). Use [`$addSeparator[]`](https://docs.botforge.org/function/$addSeparator) to create a new Separator component.

### Example
```fs
$addTextDisplay[This is a **Text Display** component __above__ the **Separator** component!]
$addSeparator[Large;false]
$addTextDisplay[This is a **Text Display** component __below__ the **Separator** component!]
```

<img src="https://i.imgur.com/lVbbu5f.png" draggable=false>

---

## Container

Containers are optional and wrap multiple child components inside a styled rounded box with an optional accent color, similar to embeds. They can include all above mentioned display components and action rows (message components). Containers also support spoilering the entire block. Use [`$addContainer[]`](https://docs.botforge.org/function/$addContainer) to create a new Container component.

> [!TIP]
> You can use multiple Container components within a single message.

### Example
```fs
$addContainer[
  $addTextDisplay[This is a **Text Display** component inside a **Container** component!]
  $addActionRow
  $addChannelSelectMenu[channelMenu;Select channels]
  $addSeparator
  $addSection[
    $addTextDisplay[This is a **Text Display** component inside a **Section** component, located in a **Container** component!]
    $addTextDisplay[It has an interactive **Button** accessory attached!]
    $addButton[click;Click Me;Primary]
  ]
;#552dd0]
```

<img src="https://i.imgur.com/3xjiyYD.png" draggable=false>
