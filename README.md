# About

This app let you see your notes on the board, where each note is draggable, so that you can set the priority of notes. You can add a note through the formular on the webside. After clicking on the note, it is available to edit it. 

## How to run the application

1. Run Backend in NotatApp
   
   ` dotnet run`

   Runs in the background.

2. Run Frontend NotatAppFrontend

   ` npm run dev`

   Runs in your browser.

## What is interesting on your code?

For fast set up of dragable cards with notes I installed pragmatic-drag-and-drop from Atlassian

``` npm i @atlaskit/pragmatic-drag-and-drop ```

[Documentation](https://atlassian.design/components/pragmatic-drag-and-drop/about)

Each card is made draggable and each card is the drop target. OnDrop function swap the notes ids, row and col indices.

``` 
  useEffect(() => {
    if (!noteRef.current) return;

    const dropConfig = dropTargetForElements({
      element: noteRef.current,
      getData: () => ({
        type: "note-slot",
        targetNoteId: note.id,
        rowIndex,
        colIndex
      }),
      onDrop: ({ source }) => {
        if (!source?.data?.sourceNoteId || source.data.sourceNoteId === note.id) return;
        onDrop(source.data.sourceNoteId, note.id, rowIndex, colIndex);
      },
    });

    const dragConfig = draggable({
      element: noteRef.current,
      getInitialData: () => ({
        type: "note",
        sourceNoteId: note.id,
        rowIndex,
        colIndex
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    const cleanup = combine(dragConfig, dropConfig);
    return () => cleanup();
  }, [note.id, rowIndex, colIndex, onDrop]);

```



## Modern approach: React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

