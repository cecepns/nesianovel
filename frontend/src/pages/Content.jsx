import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { X, ChevronDown, ChevronLeft, ChevronRight, Filter, LayoutGrid, List } from "lucide-react";
import LazyImage from "../components/LazyImage";
import AdBanner from "../components/AdBanner";
import { useAds } from "../hooks/useAds";
import { getImageUrl, apiClient } from "../utils/api";
import { getChapterTimeAgo } from "../utils/chapterTime";
import LiveChatWidget from "../components/LiveChatWidget";
import ChapterAccessLink from "../components/ChapterAccessLink";
const statusOptions = ["All", "Ongoing", "Completed", "Hiatus"];
const typeOptions = [
  { label: "All", value: "All", country: null },
  { label: "Comic", value: "Comic", country: null, apiType: "comic" },
  { label: "Manga", value: "Manga", country: "JP", apiType: "manga" },
  { label: "Manhua", value: "Manhua", country: "CN", apiType: "manhua" },
  { label: "Manhwa", value: "Manhwa", country: "KR", apiType: "manhwa" },
];
const orderOptions = ["Az", "Za", "Update", "Added", "Popular"];

const projectFilterOptions = [
  { label: "Semua", value: "all" },
  { label: "Project", value: "true" },
  { label: "Bukan project", value: "false" },
];

const sourceOptions = [
  { label: "Semua Source", value: "all" },
  { label: "Source 1", value: "kiryu" },
  { label: "Source 2", value: "apkomik" },
];

const Content = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  // Ads
  const { ads: comicTopAds } = useAds("comic-top");
  const { ads: comicFooterAds } = useAds("comic-footer");

  const [mangaList, setMangaList] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genresLoading, setGenresLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const selectedStatus = statusOptions.includes(searchParams.get("status") || "")
    ? searchParams.get("status")
    : "All";
  const selectedType = typeOptions.some(
    (type) => type.value === (searchParams.get("type") || ""),
  )
    ? searchParams.get("type")
    : "All";
  const selectedOrder = orderOptions.includes(searchParams.get("order") || "")
    ? searchParams.get("order")
    : "Update";

  const projectParam = searchParams.get("project");
  const selectedProject =
    projectParam === "true" || projectParam === "false" ? projectParam : "all";

  const selectedSource = sourceOptions.some(
    (opt) => opt.value === (searchParams.get("source") || ""),
  )
    ? searchParams.get("source")
    : "all";

  // Mobile filter & view mode states
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Load genres from API
  useEffect(() => {
    const fetchGenres = async () => {
      setGenresLoading(true);
      try {
        const data = await apiClient.request('/contents/genres');
        if (data && data.status && data.data) {
          setGenres(data.data);
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setGenresLoading(false);
      }
    };
    fetchGenres();
  }, []);

  const selectedGenres = useMemo(() => {
    const genreIdParams = searchParams
      .getAll("genreId")
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id));

    if (genreIdParams.length > 0) {
      return genreIdParams;
    }

    const genreNameParams = searchParams.getAll("genre");
    if (genreNameParams.length > 0 && genres.length > 0) {
      return genreNameParams
        .map((name) => {
          const genre = genres.find(
            (g) => g.name.toLowerCase() === name.toLowerCase(),
          );
          return genre ? genre.id : null;
        })
        .filter((id) => id !== null);
    }

    return [];
  }, [searchParams, genres]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedStatus !== "All") count++;
    if (selectedType !== "All") count++;
    if (selectedProject !== "all") count++;
    if (selectedSource !== "all") count++;
    if (selectedOrder !== "Update") count++;
    if (selectedGenres.length > 0) count += selectedGenres.length;
    return count;
  }, [selectedStatus, selectedType, selectedProject, selectedSource, selectedOrder, selectedGenres]);

  const updateSearchParams = useCallback(
    (updater) => {
      const nextParams = new URLSearchParams(searchParams);
      updater(nextParams);
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams],
  );

  const setPage = useCallback(
    (nextPage) => {
      updateSearchParams((params) => {
        const safePage = Math.max(1, Number(nextPage) || 1);
        if (safePage === 1) {
          params.delete("page");
        } else {
          params.set("page", String(safePage));
        }
      });
    },
    [updateSearchParams],
  );

  const setStatusFilter = useCallback(
    (status) => {
      updateSearchParams((params) => {
        if (status === "All") params.delete("status");
        else params.set("status", status);
        params.delete("page");
      });
    },
    [updateSearchParams],
  );

  const setTypeFilter = useCallback(
    (type) => {
      updateSearchParams((params) => {
        if (type === "All") params.delete("type");
        else params.set("type", type);
        params.delete("page");
      });
    },
    [updateSearchParams],
  );

  const setOrderFilter = useCallback(
    (order) => {
      updateSearchParams((params) => {
        if (order === "Update") params.delete("order");
        else params.set("order", order);
        params.delete("page");
      });
    },
    [updateSearchParams],
  );

  const setProjectFilter = useCallback(
    (project) => {
      updateSearchParams((params) => {
        if (project === "all") params.delete("project");
        else params.set("project", project);
        params.delete("page");
      });
    },
    [updateSearchParams],
  );

  const setSourceFilter = useCallback(
    (source) => {
      updateSearchParams((params) => {
        if (source === "all") params.delete("source");
        else params.set("source", source);
        params.delete("page");
      });
    },
    [updateSearchParams],
  );

  const fetchManga = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Add search query if exists
      if (searchQuery.trim()) {
        params.append("q", searchQuery.trim());
      }
      if (selectedProject === "true") {
        params.append("project", "true");
      } else if (selectedProject === "false") {
        params.append("project", "false");
      }

      // Add source filter
      if (selectedSource !== "all") {
        params.append("source", selectedSource);
      }

      // Common parameters
      params.append("page", currentPage);
      params.append("per_page", "24");

      // Add genre filters (can be combined with search)
      selectedGenres.forEach((genreId) => {
        params.append("genre[]", genreId);
      });

      // Add status filter (can be combined with search)
      if (selectedStatus !== "All") {
        params.append("status", selectedStatus);
      }

      // Add type filter (can be combined with search)
      const typeOption = typeOptions.find((t) => t.value === selectedType);
      if (typeOption && typeOption.value !== "All") {
        params.append("type", typeOption.apiType || typeOption.value);
      }

      // Add order filter (can be combined with search)
      if (selectedOrder !== "Update") {
        params.append("orderBy", selectedOrder);
      }

      const data = await apiClient.request(`/contents?${params.toString()}`);

      if (data && data.status && Array.isArray(data.data)) {
        setMangaList(data.data);
        setTotalPages(Math.max(1, Number(data.meta?.total_pages) || 1));
      }
    } catch (error) {
      console.error("Error fetching manga:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    selectedGenres,
    selectedStatus,
    selectedType,
    selectedOrder,
    searchQuery,
    selectedProject,
    selectedSource,
  ]);

  // Load manga based on filters
  useEffect(() => {
    fetchManga();
  }, [fetchManga]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [currentPage]);



  const toggleGenre = (genreId) => {
    updateSearchParams((params) => {
      const existing = params
        .getAll("genreId")
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id));

      const next = existing.includes(genreId)
        ? existing.filter((id) => id !== genreId)
        : [...existing, genreId];

      params.delete("genreId");
      params.delete("genre");
      next.forEach((id) => params.append("genreId", String(id)));
      params.delete("page");
    });
  };

  const clearAllFilters = () => {
    updateSearchParams((params) => {
      params.delete("genreId");
      params.delete("genre");
      params.delete("status");
      params.delete("type");
      params.delete("order");
      params.delete("project");
      params.delete("source");
      params.delete("page");
      if (searchQuery) {
        params.delete("q");
      }
    });
  };

  const clearSearch = () => {
    updateSearchParams((params) => {
      params.delete("q");
      params.delete("page");
    });
  };

  const renderPagination = () => {
    const pages = [];
    // Show fewer page numbers on mobile
    const maxVisible = window.innerWidth < 768 ? 3 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-2 md:px-3 py-2 rounded-lg text-sm md:text-base ${currentPage === 1
          ? "bg-gray-200 dark:bg-primary-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          : "bg-white dark:bg-primary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-600"
          }`}
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </button>,
    );

    // First page (only show if not in visible range)
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setPage(1)}
          className="px-3 md:px-4 py-2 rounded-lg text-sm md:text-base bg-white dark:bg-primary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-600"
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pages.push(
          <span
            key="dots1"
            className="px-1 md:px-2 text-gray-500 dark:text-gray-400"
          >
            ...
          </span>,
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base ${currentPage === i
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/40"
              : "bg-white dark:bg-primary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-600"
            }`}
        >
          {i}
        </button>,
      );
    }

    // Last page (only show if not in visible range)
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="dots2"
            className="px-1 md:px-2 text-gray-500 dark:text-gray-400"
          >
            ...
          </span>,
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className="px-3 md:px-4 py-2 rounded-lg text-sm md:text-base bg-white dark:bg-primary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-600"
        >
          {totalPages}
        </button>,
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-2 md:px-3 py-2 rounded-lg text-sm md:text-base ${currentPage === totalPages
          ? "bg-gray-200 dark:bg-primary-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
          : "bg-white dark:bg-primary-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-600"
          }`}
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </button>,
    );

    return pages;
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Helmet>
        <title>
          {searchQuery
            ? `Hasil Pencarian: "${searchQuery}" | NesiaNovel`
            : "Semua Novel | NesiaNovel - Baca Web Novel Bahasa Indonesia"}
        </title>
        <meta
          name="description"
          content={
            searchQuery
              ? `Hasil pencarian untuk "${searchQuery}" di NesiaNovel. Temukan web novel terfavoritmu.`
              : "Daftar lengkap novel, light novel, dan novel terjemahan bahasa Indonesia di NesiaNovel. Jelajahi genre romantis, aksi, fantasi, xianxia, dan lainnya."
          }
        />
      </Helmet>

      {/* Ads Section - Top — Layout sudah menyediakan Header + pt-16 di main */}
      <div className="container mx-auto px-4 pt-1 pb-1 md:pt-3">
        <AdBanner
          ads={comicTopAds}
          layout="grid"
          columns={2}
        />
      </div>

      {/* Page Header */}
      <div className="bg-transparent border-b border-purple-900/30 shadow-none top-20 z-40">
        <div className="container mx-auto px-4 py-2 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
                {searchQuery ? (
                  <>
                    Hasil Pencarian: {'"'}
                    {searchQuery}
                    {'"'}
                  </>
                ) : (
                  "Semua Novel"
                )}
              </h1>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="mt-2 flex items-center space-x-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Hapus pencarian</span>
                </button>
              )}
            </div>
            <button
              onClick={clearAllFilters}
              className="hidden items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-purple-950/50 transition-all hover:bg-purple-700 active:scale-95 md:inline-flex"
            >
              <X className="h-5 w-5 shrink-0" />
              <span className="hidden md:inline">Reset Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 pt-2 md:pt-4">
        {/* Mobile Control Bar (View Mode Toggle & Filter Trigger) */}
        <div className="lg:hidden mb-2 flex items-center justify-between">
          {/* View Mode Toggle Pill */}
          <div className="bg-[#141622] rounded-2xl p-1 flex items-center gap-1 shadow-md">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all ${viewMode === "grid"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
                }`}
              title="Grid View"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition-all ${viewMode === "list"
                  ? "bg-red-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
                }`}
              title="List View"
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* Filter Button */}
          <button
            type="button"
            onClick={() => setShowMobileFilterModal(true)}
            className="relative bg-[#141622] p-3 rounded-2xl text-red-500 hover:text-red-400 transition-colors shadow-md flex items-center justify-center"
            title="Filter"
          >
            <Filter className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-[#141622]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Bottom Sheet Filter Modal */}
        {showMobileFilterModal && (
          <div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#13141f] max-h-[85vh] flex flex-col shadow-2xl text-white overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h3 className="text-base font-bold tracking-wider uppercase text-white">Filter</h3>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowMobileFilterModal(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-5 space-y-6 flex-1 text-left">
                {/* STATUS */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">STATUS</h4>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedStatus === status
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-[#1e202e] text-gray-300 hover:bg-[#252839]'
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TIPE / KATEGORI */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">TIPE / KATEGORI</h4>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setTypeFilter(type.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedType === type.value
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-[#1e202e] text-gray-300 hover:bg-[#252839]'
                          }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PROJECT */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">PROJECT</h4>
                  <div className="flex flex-wrap gap-2">
                    {projectFilterOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setProjectFilter(opt.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedProject === opt.value
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-[#1e202e] text-gray-300 hover:bg-[#252839]'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SOURCE */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">SOURCE</h4>
                  <div className="flex flex-wrap gap-2">
                    {sourceOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSourceFilter(opt.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSource === opt.value
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-[#1e202e] text-gray-300 hover:bg-[#252839]'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* URUTKAN */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">URUTKAN</h4>
                  <div className="flex flex-wrap gap-2">
                    {orderOptions.map((order) => (
                      <button
                        key={order}
                        type="button"
                        onClick={() => setOrderFilter(order)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedOrder === order
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-[#1e202e] text-gray-300 hover:bg-[#252839]'
                          }`}
                      >
                        {order}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GENRE */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">GENRE</h4>
                  {genresLoading ? (
                    <p className="text-xs text-gray-500">Memuat genre...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                      {genres.map((genre) => {
                        const isSelected = selectedGenres.includes(genre.id);
                        return (
                          <button
                            key={genre.id}
                            type="button"
                            onClick={() => toggleGenre(genre.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isSelected
                                ? 'bg-red-600 text-white shadow-md font-bold'
                                : 'bg-[#1e202e] text-gray-300 hover:bg-[#252839]'
                              }`}
                          >
                            {genre.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer (Added extra bottom padding so it sits above BottomNavigation) */}
              <div className="p-4 pb-20 sm:pb-4 border-t border-white/10 bg-[#141522]">
                <button
                  type="button"
                  onClick={() => setShowMobileFilterModal(false)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-md"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:w-80 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-purple-900/40 bg-[#130c24]/90 p-5 shadow-xl backdrop-blur-md">
              {/* Clear All button inside header */}
              <div className="mb-4 flex items-center justify-between pb-3 border-b border-purple-900/30">
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  Filter Novel
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center justify-center rounded-lg bg-purple-900/50 border border-purple-700/40 px-2.5 py-1 text-xs font-semibold text-purple-200 transition-all hover:bg-purple-800 hover:text-white"
                >
                  Reset
                </button>
              </div>

              {/* Status Filter */}
              <div className="mb-5">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-purple-300/80 mb-2.5">
                  Status
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 ${selectedStatus === status
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/40"
                          : "bg-purple-950/40 border border-purple-900/30 text-purple-200/80 hover:bg-purple-900/40 hover:text-white"
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project filter */}
              <div className="mb-5">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-purple-300/80 mb-2.5">
                  Project
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {projectFilterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProjectFilter(opt.value)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 ${selectedProject === opt.value
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/40"
                          : "bg-purple-950/40 border border-purple-900/30 text-purple-200/80 hover:bg-purple-900/40 hover:text-white"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Filter */}
              <div className="mb-5">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-purple-300/80 mb-2.5">
                  Urutan
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {orderOptions.map((order) => (
                    <button
                      key={order}
                      onClick={() => setOrderFilter(order)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 ${selectedOrder === order
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/40"
                          : "bg-purple-950/40 border border-purple-900/30 text-purple-200/80 hover:bg-purple-900/40 hover:text-white"
                        }`}
                    >
                      {order}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres Filter - Modern Pill Tags */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-purple-300/80">
                    Genres
                  </h4>
                  {selectedGenres.length > 0 && (
                    <span className="text-[11px] text-purple-400 font-semibold">
                      {selectedGenres.length} aktif
                    </span>
                  )}
                </div>
                {genresLoading ? (
                  <div className="text-center py-4 text-xs text-purple-400">
                    Memuat genre...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1 [scrollbar-width:thin]">
                    {genres.map((genre) => {
                      const isSelected = selectedGenres.includes(genre.id);
                      return (
                        <button
                          key={genre.id}
                          type="button"
                          onClick={() => toggleGenre(genre.id)}
                          className={`rounded-xl px-2.5 py-1 text-xs transition-all ${
                            isSelected
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-900/50 border border-purple-400/40 scale-105"
                              : "bg-purple-950/40 border border-purple-900/30 text-purple-200/80 hover:bg-purple-900/50 hover:text-white"
                          }`}
                        >
                          {genre.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            {(searchQuery ||
              selectedGenres.length > 0 ||
              selectedStatus !== "All" ||
              selectedType !== "All" ||
              selectedOrder !== "Update" ||
              selectedProject !== "all" ||
              selectedSource !== "all") && (
                <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-primary-700 dark:bg-primary-900">
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold border border-red-200 dark:border-red-900/40">
                        <span>
                          Pencarian: {'"'}
                          {searchQuery}
                          {'"'}
                        </span>
                        <button
                          onClick={clearSearch}
                          className="hover:text-red-900 dark:hover:text-red-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    )}
                    {selectedGenres.map((genreId) => {
                      const genre = genres.find((g) => g.id === genreId);
                      return genre ? (
                        <span
                          key={genreId}
                          className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-950/80 text-purple-200 rounded-full text-xs font-semibold border border-purple-700/50"
                        >
                          <span>{genre.name}</span>
                          <button
                            onClick={() => toggleGenre(genreId)}
                            className="hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ) : null;
                    })}
                    {selectedStatus !== "All" && (
                      <span className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-950/80 text-purple-200 rounded-full text-xs font-semibold border border-purple-700/50">
                        <span>Status: {selectedStatus}</span>
                        <button
                          onClick={() => setStatusFilter("All")}
                          className="hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    {selectedProject !== "all" && (
                      <span className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-950/80 text-purple-200 rounded-full text-xs font-semibold border border-purple-700/50">
                        <span>
                          Project:{" "}
                          {selectedProject === "true" ? "Ya" : "Bukan project"}
                        </span>
                        <button
                          onClick={() => setProjectFilter("all")}
                          className="hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                    {selectedOrder !== "Update" && (
                      <span className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-950/80 text-purple-200 rounded-full text-xs font-semibold border border-purple-700/50">
                        <span>Order: {selectedOrder}</span>
                        <button
                          onClick={() => setOrderFilter("Update")}
                          className="hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

            {/* Quick Horizontal Genre Filter Bar for Novels */}
            {genres.length > 0 && (
              <div className="mb-5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      updateSearchParams((params) => {
                        params.delete("genreId");
                        params.delete("genre");
                        params.delete("page");
                      });
                    }}
                    className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      selectedGenres.length === 0
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/40"
                        : "bg-[#130c24]/90 text-purple-200/80 border border-purple-900/40 hover:bg-purple-900/50 hover:text-white"
                    }`}
                  >
                    Semua Genre
                  </button>
                  {genres.map((g) => {
                    const isSelected = selectedGenres.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGenre(g.id)}
                        className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/40 scale-105"
                            : "bg-[#130c24]/90 text-purple-200/80 border border-purple-900/40 hover:bg-purple-900/50 hover:text-white"
                        }`}
                      >
                        {g.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-purple-300 text-sm">
                  Memuat novel...
                </p>
              </div>
            ) : mangaList.length === 0 ? (
              <div className="text-center py-12 bg-[#130c24]/60 border border-purple-900/30 rounded-2xl">
                <p className="text-purple-300 text-sm">
                  Tidak ada novel ditemukan dengan filter yang dipilih
                </p>
              </div>
            ) : (
              <>
                {/* Manga Grid / List View */}
                {viewMode === "list" ? (
                  <div className="flex flex-col gap-3 mb-8">
                    {mangaList.map((manga) => (
                      <div
                        key={manga.id}
                        onClick={() => navigate(`/novel/${manga.slug}`)}
                        className="bg-[#130c24]/80 border border-purple-900/30 rounded-xl shadow-md hover:shadow-xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden flex gap-3.5 p-3 cursor-pointer group"
                      >
                        {/* Cover Image */}
                        <div className="relative w-24 sm:w-28 aspect-[3/4] shrink-0 overflow-hidden rounded-lg bg-purple-950/50">
                          <LazyImage
                            src={getImageUrl(manga.cover)}
                            alt={manga.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            wrapperClassName="w-full h-full"
                          />
                          {manga.rating > 0 && (
                            <div className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-yellow-500/95 text-white shadow backdrop-blur-sm flex items-center justify-center">
                              <span className="text-[10px] font-bold leading-none">
                                {Number(manga.rating).toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                          <div>
                            {!!manga.hot && (
                              <div className="mb-1 inline-block bg-purple-600/90 backdrop-blur-sm rounded-full px-2 py-0.5">
                                <span className="text-white text-[10px] font-bold">HOT</span>
                              </div>
                            )}
                            <Link
                              to={`/novel/${manga.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block"
                            >
                              <h3 className="font-bold text-sm md:text-base line-clamp-2 text-gray-200 group-hover:text-purple-400 transition-colors">
                                {manga.title}
                              </h3>
                            </Link>
                          </div>

                          {manga.lastChapters?.length > 0 ? (
                            <div className="space-y-1.5 mt-2">
                              {manga.lastChapters.slice(0, 2).map((chapter) => (
                                <ChapterAccessLink
                                  key={chapter.slug}
                                  chapter={chapter}
                                  to={`/novel/${manga.slug}/${chapter.slug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  label={`Chapter ${chapter.number || "N/A"}`}
                                  meta={getChapterTimeAgo(chapter) || null}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-purple-400/60 mt-2">Chapter N/A</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
                    {mangaList.map((manga) => (
                      <div
                        key={manga.id}
                        onClick={() => navigate(`/novel/${manga.slug}`)}
                        className="bg-[#130c24]/80 border border-purple-900/30 rounded-xl shadow-md hover:shadow-xl hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col"
                      >
                        {/* Cover Image */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-purple-950/50">
                          <LazyImage
                            src={getImageUrl(manga.cover)}
                            alt={manga.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            wrapperClassName="w-full h-full"
                          />
                        </div>

                        {/* Info Section */}
                        <div className="p-3 flex flex-col h-[185px]">
                          {/* Title */}
                          {!!manga.hot && (
                            <div className="mb-1 max-w-fit bg-purple-600/90 backdrop-blur-sm rounded-full px-2 py-0.5">
                              <span className="text-white text-[10px] font-bold">
                                HOT
                              </span>
                            </div>
                          )}
                          <div className="min-h-[2.75rem] md:min-h-[3rem] mb-2 flex items-center">
                            <Link
                              to={`/novel/${manga.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block w-full"
                            >
                              <h3 className="font-bold text-xs md:text-sm line-clamp-2 text-gray-200 group-hover:text-purple-400 transition-colors">
                                {manga.title}
                              </h3>
                            </Link>
                          </div>

                          {manga.lastChapters?.length > 0 ? (
                            <div className="space-y-1.5 mb-1 mt-auto">
                              {manga.lastChapters.slice(0, 3).map((chapter) => (
                                <ChapterAccessLink
                                  key={chapter.slug}
                                  chapter={chapter}
                                  to={`/novel/${manga.slug}/${chapter.slug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  label={`Chapter ${chapter.number || "N/A"}`}
                                  meta={getChapterTimeAgo(chapter) || null}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-purple-400/60 mb-1 mt-auto">
                              Chapter N/A
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div className="flex justify-center items-center space-x-2 pb-8 md:pb-4">
                  {renderPagination()}
                </div>

                {comicFooterAds.length > 0 && (
                  <div className="mt-6 pb-20 md:pb-8">
                    <AdBanner
                      ads={comicFooterAds}
                      layout="grid"
                      columns={2}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <LiveChatWidget />
    </div>
  );
};

export default Content;
