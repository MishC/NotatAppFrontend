import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Save } from "lucide-react";
import DiaryEditor from "./DiaryEditor";
import DiarySidebar from "./DiarySidebar";
import NavigationBar from "./NavigationBar";
import {
  createDiaryEntryAction,
  createDiaryPageAction,
  initDiaryEntriesAction,
  loadDiaryPageImageAction,
  updateDiaryEntryAction,
  updateDiaryPageAction,
} from "../actions/diaryAction";
import { recommendSongAction } from "../actions/aiActions";
import {
  formatDateDDMMYYYY,
  formatDiaryTitleDate,
  parseDiaryDateInput,
} from "../helpers/dateHelpers";
import {
  DEFAULT_DIARY_DATE,
  DEFAULT_ENTRY_TITLE,
  DEFAULT_TITLE_FORMAT,
  PAGE_MAX_HEIGHT,
  attachDiaryPageImageToHtml,
  createPagePixelTiles,
  getDiaryApiBase,
  htmlToText,
  normalizeLoadedDiaryPages,
  prepareDiaryPageForBackend,
} from "../helpers/diaryHelpers";
import {
  applyImageAlignment,
  changeEditorFontSize,
  createImageWrapper,
  getImageWrapperFromNode,
  insertDefaultLineBreakInEditor,
  insertNodeInEditor,
  insertQuoteInEditor,
  mergeSongRecommendationIntoPages,
  resolveCountryFromGeolocation,
} from "../helpers/diaryEditorHelpers";
import { openDiaryPdfWindow } from "../helpers/diaryPdfHelpers";
import "./styles/Diary.css";

export default function Diary() {
  const user = useSelector((s) => s.auth.user);
  const guest = useSelector((s) => s.auth.guest);
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const pagesRef = useRef([]);
  const selectedImageWrapperRef = useRef(null);
  const didAutoLoadRef = useRef(false);
  const previousPageIndexRef = useRef(0);
  const pixelTimerRef = useRef(null);
  const API_URL_DIARY = getDiaryApiBase();
  const API_URL_AI = import.meta.env.VITE_API_AI || import.meta.env.VITE_API_URL;
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [loadedEntryId, setLoadedEntryId] = useState(null);
  const [pages, setPages] = useState([{ title: DEFAULT_ENTRY_TITLE, html: "", text: "" }]);
  const [pageIndex, setPageIndex] = useState(0);
  const [frameStyle, setFrameStyle] = useState("marker");
  const [lookupDate, setLookupDate] = useState(formatDateDDMMYYYY(DEFAULT_DIARY_DATE));
  const [diaryDate, setDiaryDate] = useState(DEFAULT_DIARY_DATE);
  const [titleFormat, setTitleFormat] = useState(DEFAULT_TITLE_FORMAT);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [editorLoadKey, setEditorLoadKey] = useState(0);
  const [showRuledLines, setShowRuledLines] = useState(false);
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false);
  const [alignmentMenuOpen, setAlignmentMenuOpen] = useState(false);
  const [songMenuOpen, setSongMenuOpen] = useState(false);
  const [localSongAvailable, setLocalSongAvailable] = useState(false);
  const [localSongCountry, setLocalSongCountry] = useState("");
  const [pagePixels, setPagePixels] = useState([]);
  const [msg, setMsg] = useState("");

  const currentPage = pages[pageIndex] || pages[0];
  const entryTitle = currentPage.title;
  const entryText = currentPage.text;
  const userName = user?.name || user?.email || "Guest";

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(()=>{if (msg) { const timer = setTimeout(() => setMsg(""), 3000); return () => clearTimeout(timer); } },[msg])

  useEffect(() => {
    resolveCountryFromGeolocation().then((country) => {
      setLocalSongCountry(country);
      setLocalSongAvailable(Boolean(country));
    });
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = pagesRef.current[pageIndex]?.html || "";
  }, [pageIndex, editorLoadKey]);

  useEffect(() => {
    if (previousPageIndexRef.current === pageIndex) return;

    if (pixelTimerRef.current) clearTimeout(pixelTimerRef.current);
    setPagePixels(createPagePixelTiles());
    previousPageIndexRef.current = pageIndex;

    pixelTimerRef.current = setTimeout(() => {
      setPagePixels([]);
    }, 1200);
  }, [pageIndex]);

  useEffect(() => {
    return () => {
      if (pixelTimerRef.current) clearTimeout(pixelTimerRef.current);
    };
  }, []);

  const updateCurrentPage = (updates) => {
    setPages((prev) =>
      prev.map((page, index) => (index === pageIndex ? { ...page, ...updates } : page))
    );
  };

  const runCommand = (command, value = null) => {
    editorRef.current?.focus();

    if (
      applyImageAlignment({
        command,
        editor: editorRef.current,
        selectedWrapper: selectedImageWrapperRef.current,
        onSelectedWrapperChange: (wrapper) => {
          selectedImageWrapperRef.current = wrapper;
        },
        onSync: syncEditorToPage,
      })
    ) {
      return;
    }

    document.execCommand(command, false, value);
    updateCurrentPage({
      html: editorRef.current?.innerHTML || "",
      text: editorRef.current?.innerText || "",
    });
  };

  const insertText = (text) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, text);
    updateCurrentPage({
      html: editorRef.current?.innerHTML || "",
      text: editorRef.current?.innerText || "",
    });
  };

  const handleEditorClick = (e) => {
    const link = e.target.closest?.(".diary-song-recommendation a[href]");
    if (link) {
      e.preventDefault();
      window.open(link.href, "_blank", "noopener,noreferrer");
      return;
    }

    selectedImageWrapperRef.current = getImageWrapperFromNode(e.target);
  };

  const handleImageButtonClick = () => {
    setEmojiMenuOpen(false);
    setAlignmentMenuOpen(false);
    imageInputRef.current?.click();
  };

  const handleImageSelected = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = document.createElement("img");
      image.src = reader.result;
      image.alt = file.name;
      image.className = "diary-editor-image";
      image.draggable = false;

      const wrapper = createImageWrapper(image);
      insertNodeInEditor(editorRef.current, wrapper, syncEditorToPage);
      selectedImageWrapperRef.current = wrapper;
      setMsg("Image added to diary page.");
    };
    reader.onerror = () => setMsg("Could not load this image.");
    reader.readAsDataURL(file);
  };

  const increaseFontSize = () => changeEditorFontSize(editorRef.current, 1, syncEditorToPage);
  const decreaseFontSize = () => changeEditorFontSize(editorRef.current, -1, syncEditorToPage);
  const insertQuote = () => insertQuoteInEditor(editorRef.current, syncEditorToPage);

  const syncEditorToPage = () => {
    updateCurrentPage({
      html: editorRef.current?.innerHTML || "",
      text: editorRef.current?.innerText || "",
    });
  };

  const insertSongsOnLastPage = (songs, contextLabel = "") => {
    if (!songs.length) return;

    const currentHtml = editorRef.current?.innerHTML || "";
    const currentText = editorRef.current?.innerText || "";
    const { htmlToInsert, lastIndex, nextPages } = mergeSongRecommendationIntoPages({
      pages: pagesRef.current,
      pageIndex,
      currentHtml,
      currentText,
      songs,
      contextLabel,
    });

    pagesRef.current = nextPages;
    setPages(nextPages);

    if (pageIndex !== lastIndex) {
      setPageIndex(lastIndex);
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = nextPages[lastIndex]?.html || "";
        }
        setEditorLoadKey((key) => key + 1);
      });
      return;
    }

    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      editorRef.current.innerHTML = nextPages[lastIndex]?.html || `${currentHtml}${currentHtml ? "<br>" : ""}${htmlToInsert}`;
    });
  };

  const deleteCurrentPage = () => {
    if (pages.length === 1) {
      setPages([{ title: formatDiaryTitleDate(diaryDate, titleFormat), html: "", text: "" }]);
      setPageIndex(0);
      setEditorLoadKey((key) => key + 1);
      setMsg("Page cleared.");
      return;
    }

    const nextIndex = pageIndex === pages.length - 1 ? pageIndex - 1 : pageIndex;
    setPages((prev) => prev.filter((_, index) => index !== pageIndex));
    setPageIndex(nextIndex);
    setEditorLoadKey((key) => key + 1);
    setMsg("Page deleted.");
  };

  const handleEditorKeyDown = (e) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    insertDefaultLineBreakInEditor(editorRef.current);
    updateCurrentPage({
      html: editorRef.current?.innerHTML || "",
      text: editorRef.current?.innerText || "",
    });
  };

  const goToPage = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= pages.length) return;
    syncEditorToPage();
    setPageIndex(nextIndex);
  };

  const addPage = () => {
    const nextIndex = pages.length;
    setPages((prev) => [
      ...prev,
      {
        id: null,
        pageNumber: prev.length + 1,
        title: formatDiaryTitleDate(diaryDate, titleFormat),
        html: "",
        text: "",
      },
    ]);
    syncEditorToPage();
    setPageIndex(nextIndex);
  };

  const handleEditorInput = (e) => {
    const html = e.currentTarget.innerHTML;
    const text = e.currentTarget.innerText;

    updateCurrentPage({ html, text });

    if (e.currentTarget.scrollHeight <= PAGE_MAX_HEIGHT) return;

    const nextIndex = pageIndex + 1;
    if (nextIndex >= pagesRef.current.length) {
      setPages((prev) => [
        ...prev,
        {
          id: null,
          pageNumber: prev.length + 1,
          title: formatDiaryTitleDate(diaryDate, titleFormat),
          html: "",
          text: "",
        },
      ]);
    }

    setMsg("Page limit reached. Continuing on the next page.");
    setPageIndex(nextIndex);
  };

  const handleSave = async () => {
    setMsg("");

    if (guest) {
      setMsg("Diary can be saved only when you are logged in.");
      return;
    }

    const currentPages = await Promise.all(pagesRef.current.map(async (page, index) => {
      const rawHtml = index === pageIndex ? editorRef.current?.innerHTML || "" : page.html || "";
      const prepared = await prepareDiaryPageForBackend(rawHtml, index + 1);

      return {
        ...page,
        html: rawHtml,
        contentForApi: prepared.content,
        text: index === pageIndex ? editorRef.current?.innerText || "" : page.text,
        image: prepared.image,
      };
    }));
    const title = formatDiaryTitleDate(diaryDate, titleFormat);

    setLoadingEntry(true);
    try {
      if (!loadedEntryId) {
        const createdEntry = await createDiaryEntryAction({
          guest: false,
          API_URL_DIARY,
          diaryEntries,
          setDiaryEntries,
          setMsg,
          setError: setMsg,
          newEntry: {
            title,
            date: diaryDate,
            content: currentPages[0]?.contentForApi || "",
            image: currentPages[0]?.image,
          },
        });

        if (!createdEntry) return;

        const createdPages = createdEntry.pages || [];
        const nextPages = currentPages.map((page, index) => ({
          ...page,
          id: createdPages[index]?.id ?? page.id ?? null,
          pageNumber: createdPages[index]?.pageNumber ?? index + 1,
          title,
        }));

        for (let index = 1; index < nextPages.length; index += 1) {
          const createdPage = await createDiaryPageAction({
            guest: false,
            API_URL_DIARY,
            entryId: createdEntry.id,
            newPage: {
              pageNumber: index + 1,
              content: nextPages[index].contentForApi || "",
              image: nextPages[index].image,
            },
            activeDate: null,
            setDiaryEntries,
            setLoading: setLoadingEntry,
            setMsg,
            setError: setMsg,
          });

          if (createdPage?.id) {
            nextPages[index] = {
              ...nextPages[index],
              id: createdPage.id,
              pageNumber: createdPage.pageNumber ?? index + 1,
            };
          }
        }

        setLoadedEntryId(createdEntry.id);
        setPages(nextPages);
        setEditorLoadKey((key) => key + 1);
        setMsg("Diary saved.");
        return;
      }

      await updateDiaryEntryAction({
        guest: false,
        API_URL_DIARY,
        entryId: loadedEntryId,
        updatedFields: { title, date: diaryDate },
        selectedEntry:
          diaryEntries.find((entry) => String(entry.id) === String(loadedEntryId)) || {
            id: loadedEntryId,
            title,
            date: diaryDate,
          },
        activeDate: null,
        setDiaryEntries,
        setLoading: setLoadingEntry,
        setError: setMsg,
        setMsg,
      });

      const nextPages = [...currentPages];

      for (let index = 0; index < nextPages.length; index += 1) {
        const page = nextPages[index];

        if (page.id) {
          await updateDiaryPageAction({
            guest: false,
            API_URL_DIARY,
            pageId: page.id,
            updatedFields: {
              pageNumber: index + 1,
              content: page.contentForApi || "",
              image: page.image,
            },
            activeDate: null,
            setDiaryEntries,
            setLoading: setLoadingEntry,
            setError: setMsg,
            setMsg,
          });
          continue;
        }

        const createdPage = await createDiaryPageAction({
          guest: false,
          API_URL_DIARY,
          entryId: loadedEntryId,
          newPage: {
            pageNumber: index + 1,
            content: page.contentForApi || "",
            image: page.image,
          },
          activeDate: null,
          setDiaryEntries,
          setLoading: setLoadingEntry,
          setMsg,
          setError: setMsg,
        });

        if (createdPage?.id) {
          nextPages[index] = {
            ...page,
            id: createdPage.id,
            pageNumber: createdPage.pageNumber ?? index + 1,
          };
        }
      }

      setPages(nextPages.map((page, index) => ({ ...page, title, pageNumber: index + 1 })));
      setMsg("Diary saved.");
    } finally {
      setLoadingEntry(false);
    }
  };

  const handleSongSuggestion = async (songPreference) => {
    syncEditorToPage();

    if (!loadedEntryId) {
      setMsg("Save or load this diary entry first, then AI can choose a song.");
      return;
    }

    const songs = await recommendSongAction({
      guest,
      API_URL_AI,
      diaryEntryId: loadedEntryId,
      style: songPreference,
      setLoading: setLoadingEntry,
      setError: setMsg,
    });

    if (!songs.length) {
      setMsg("No song recommendations found.");
      return;
    }

    const contextLabel = songPreference === "Local" ? localSongCountry : "";
    insertSongsOnLastPage(songs, contextLabel);
    setMsg("Song recommendation inserted on the last diary page.");
  };

  const handleTitleFormatChange = (nextFormat) => {
    const normalizedLookupDate = parseDiaryDateInput(lookupDate);
    const dateForFormat = normalizedLookupDate || diaryDate;
    const nextTitle = formatDiaryTitleDate(dateForFormat, nextFormat);

    setTitleFormat(nextFormat);
    setLookupDate(nextTitle);
    setPages((prev) => prev.map((page) => ({ ...page, title: nextTitle })));
  };

  const handleSaveAsPdf = () => {
    syncEditorToPage();

    const printablePages = pagesRef.current.map((page, index) => ({
      ...page,
      html: index === pageIndex ? editorRef.current?.innerHTML || "" : page.html || "",
    }));
    const title = entryTitle || DEFAULT_ENTRY_TITLE;

    if (!openDiaryPdfWindow({ pages: printablePages, title })) {
      setMsg("Allow pop-ups to save this diary page as PDF.");
    }
  };

  const setEmptyDiaryPageForDate = (normalizedDate) => {
    const title = formatDiaryTitleDate(normalizedDate, titleFormat);

    setDiaryDate(normalizedDate);
    setLoadedEntryId(null);
    setPages([{ id: null, pageNumber: 1, title, html: "", text: "" }]);
    setPageIndex(0);
    setEditorLoadKey((key) => key + 1);
  };

  const normalizeLoadedDiaryPagesWithImages = async (entry, title) => {
    const normalizedPages = normalizeLoadedDiaryPages(entry, title);

    if (guest) return normalizedPages;

    return Promise.all(
      normalizedPages.map(async (page) => {
        if (!page.id || !page.hasImage) return page;

        const imageUrl = await loadDiaryPageImageAction({
          API_URL_DIARY,
          pageId: page.id,
          setError: setMsg,
        });

        if (!imageUrl) return page;

        const html = attachDiaryPageImageToHtml(
          page.html,
          imageUrl,
          page.imageFileName || `Diary page ${page.pageNumber || ""} image`
        );

        return {
          ...page,
          html,
          text: htmlToText(html),
        };
      })
    );
  };

  const loadDiaryByDate = async (normalizedDate, { showMessage = true } = {}) => {
    if (!normalizedDate) {
      setMsg("Use date format like DD-MM-YYYY, DD. Month YYYY, or Month of D(th), YYYY.");
      return;
    }

    setLookupDate(formatDiaryTitleDate(normalizedDate, titleFormat));
    setMsg("");
    setLoadingEntry(true);
    let loadedEntries = [];

    const ok = await initDiaryEntriesAction({
      guest,
      API_URL_DIARY,
      date: normalizedDate,
      setDiaryEntries: (entries) => {
        loadedEntries = entries || [];
        setDiaryEntries(entries || []);
      },
      setLoading: setLoadingEntry,
      setError: setMsg,
    });

    if (!ok) {
      setEmptyDiaryPageForDate(normalizedDate);
      return;
    }

    const title = formatDiaryTitleDate(normalizedDate, titleFormat);
    const loadedEntry = loadedEntries[0];

    if (!loadedEntry) {
      setEmptyDiaryPageForDate(normalizedDate);
      if (showMessage) {
        setMsg("No diary entry found for this date. You can start writing it now.");
      }
      return;
    }

    setDiaryDate(String(loadedEntry.date || normalizedDate).slice(0, 10));
    setLoadedEntryId(loadedEntry.id);
    const hydratedPages = await normalizeLoadedDiaryPagesWithImages(loadedEntry, title);
    setPages(hydratedPages);
    setPageIndex(0);
    setEditorLoadKey((key) => key + 1);
    if (showMessage) {
      setMsg("Diary entry loaded. You can edit it now.");
    }
  };

  const handleLoadEntry = () => {
    const normalizedDate = parseDiaryDateInput(lookupDate);
    loadDiaryByDate(normalizedDate);
  };

  useEffect(() => {
    if (didAutoLoadRef.current) return;

    didAutoLoadRef.current = true;
    loadDiaryByDate(DEFAULT_DIARY_DATE, { showMessage: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Diary min-h-screen bg-emerald-50">
      <NavigationBar
        userName={userName}
        isNavItemVisble={true}
        isEmailVisible={true}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
        <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Personal diary
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
              Write, shape, and keep the day.
            </h1>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm hover:bg-orange-600 transition"
          >
            <Save className="h-4 w-4" />
            Save draft
          </button>
        </section>

        {msg && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-white/70 px-4 py-3 text-emerald-700">
            {msg}
          </div>
        )}

        <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_280px] lg:items-stretch">
          <DiaryEditor
            addPage={addPage}
            alignmentMenuOpen={alignmentMenuOpen}
            decreaseFontSize={decreaseFontSize}
            deleteCurrentPage={deleteCurrentPage}
            editorRef={editorRef}
            emojiMenuOpen={emojiMenuOpen}
            entryText={entryText}
            frameStyle={frameStyle}
            goToPage={goToPage}
            guest={guest}
            handleEditorInput={handleEditorInput}
            handleEditorClick={handleEditorClick}
            handleEditorKeyDown={handleEditorKeyDown}
            handleImageButtonClick={handleImageButtonClick}
            handleImageSelected={handleImageSelected}
            handleLoadEntry={handleLoadEntry}
            handleSaveAsPdf={handleSaveAsPdf}
            handleSongSuggestion={handleSongSuggestion}
            handleTitleFormatChange={handleTitleFormatChange}
            imageInputRef={imageInputRef}
            increaseFontSize={increaseFontSize}
            insertQuote={insertQuote}
            insertText={insertText}
            localSongAvailable={localSongAvailable}
            loadingEntry={loadingEntry}
            lookupDate={lookupDate}
            pageIndex={pageIndex}
            pagePixels={pagePixels}
            pages={pages}
            runCommand={runCommand}
            setAlignmentMenuOpen={setAlignmentMenuOpen}
            setEmojiMenuOpen={setEmojiMenuOpen}
            setSongMenuOpen={setSongMenuOpen}
            setLookupDate={setLookupDate}
            setShowRuledLines={setShowRuledLines}
            showRuledLines={showRuledLines}
            songMenuOpen={songMenuOpen}
            titleFormat={titleFormat}
          />

          <DiarySidebar
            activeFrame={frameStyle}
            onFrameChange={setFrameStyle}
            onInsertPrompt={insertText}
            onMessage={setMsg}
          />
        </section>
      </main>
    </div>
  );
}
