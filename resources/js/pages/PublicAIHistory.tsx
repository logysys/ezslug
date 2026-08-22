import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import DraggableMenu from '@/components/DraggableMenu';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner, 
    faGlobe, 
    faUser, 
    faRobot,
    faClock,
    faComment,
    faDollarSign,
    faHashtag,
    faExternalLinkAlt,
    faSearch,
    faTimes,
    faCheckCircle,
    faExclamationTriangle,
    faThumbtack,
    faSyncAlt,
    faChartLine,
    faFolderOpen,
    faBookmark,
    faQrcode,
    faPlus,
    faArrowUp,
    faArrowDown,
    faMinus
} from '@fortawesome/free-solid-svg-icons';

interface Conversation {
    id: number;
    slug: string;
    conversation_id: string;
    conversation_title: string;
    query: string;
    response_preview: string;
    created_at: string;
    created_at_formatted: string;
    updated_at_formatted: string;
    share_url: string;
    message_count: number;
    total_tokens: number;
    conversation_cost: number;
    thinking_enabled: boolean;
    model: string;
    temperature: number;
    language: string;
    user_email?: string;
    pinned?: boolean;
    pinned_order?: number | null;
}

interface PaginatedResponse {
    success: boolean;
    data: Conversation[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface Auth {
    user: AuthUser | null;
}

interface ComingSoonModalState {
    isOpen: boolean;
    feature: string;
    description: string;
    iconColor: string;
    icon: JSX.Element | null;
}

const LANGUAGE_LABELS: Record<string, string> = {
    en: 'English',
    zh: '中文',
    ja: '日本語',
    ko: '한국어',
    ar: 'العربية',
};

const formatCost = (cost: number | undefined | null): string => {
    if (cost === undefined || cost === null) return '0.0000';
    const numCost = Number(cost);
    return isNaN(numCost) ? '0.0000' : numCost.toFixed(4);
};

const getLanguageLabel = (lang: string): string => LANGUAGE_LABELS[lang] || lang;

const maskEmail = (email: string | undefined): string => {
    if (!email) return '';
    
    const [localPart, domain] = email.split('@');
    
    if (localPart && domain) {
        const firstTwo = localPart.substring(0, 2);
        const lastThree = domain.substring(domain.length - 3);
        
        return `${firstTwo}${'*'.repeat(3)}@${'*'.repeat(3)}${lastThree}`;
    }
    
    return email;
};

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-yellow-400">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default function PublicAIHistory({ 
    conversations: initialConversations,
    totalConversations,
    currentPage,
    lastPage,
    perPage,
    auth = { user: null },
}: {
    conversations: any;
    totalConversations: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    auth?: Auth;
}) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(currentPage < lastPage);
    const [page, setPage] = useState(currentPage);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    
    const [comingSoonModal, setComingSoonModal] = useState<ComingSoonModalState>({
        isOpen: false,
        feature: '',
        description: '',
        iconColor: '',
        icon: null,
    });
    
    const loaderRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const convData = initialConversations?.data || [];
        setConversations(convData);
    }, [initialConversations]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredConversations(conversations);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = conversations.filter(conv => 
                conv.conversation_title?.toLowerCase().includes(query) ||
                conv.query?.toLowerCase().includes(query) ||
                conv.response_preview?.toLowerCase().includes(query) ||
                (conv.user_email && conv.user_email.toLowerCase().includes(query))
            );
            
            const sortedFiltered = [...filtered].sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                
                if (a.pinned && b.pinned) {
                    const orderA = a.pinned_order ?? 999999;
                    const orderB = b.pinned_order ?? 999999;
                    return orderA - orderB;
                }
                
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            
            setFilteredConversations(sortedFiltered);
        }
    }, [searchQuery, conversations]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading]);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        
        setLoading(true);
        
        try {
            const response = await axios.get<PaginatedResponse>('/public/ai/history/load-more', {
                params: {
                    page: page + 1,
                    per_page: perPage
                }
            });
            
            if (response.data.success) {
                const newConversations = response.data.data;
                setConversations(prev => [...prev, ...newConversations]);
                setPage(response.data.meta.current_page);
                setHasMore(response.data.meta.current_page < response.data.meta.last_page);
            }
        } catch (error) {
            console.error('Failed to load more conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, page, perPage]);

    const handleNewSearch = useCallback(() => {
        router.get('/');
    }, []);

    const openComingSoonModal = useCallback((feature: string, description: string, iconColor: string, icon: JSX.Element) => {
        setComingSoonModal({
            isOpen: true,
            feature,
            description,
            iconColor,
            icon,
        });
    }, []);

    const closeComingSoonModal = useCallback(() => {
        setComingSoonModal(prev => ({ ...prev, isOpen: false }));
    }, []);

    const getModelIcon = (model: string) => {
        if (model.includes('kimi')) {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
            );
        }
        return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8M8 12h8"/>
            </svg>
        );
    };

    const totalCost = conversations.reduce((acc, conv) => {
        const cost = conv.conversation_cost !== undefined && conv.conversation_cost !== null 
            ? Number(conv.conversation_cost) 
            : 0;
        return acc + (isNaN(cost) ? 0 : cost);
    }, 0);

    const totalMessages = conversations.reduce((acc, conv) => acc + (conv.message_count || 0), 0);

    const pinnedConversations = filteredConversations
        .filter(conv => conv.pinned)
        .sort((a, b) => {
            const orderA = a.pinned_order ?? 999999;
            const orderB = b.pinned_order ?? 999999;
            return orderA - orderB;
        });

    const unpinnedConversations = filteredConversations.filter(conv => !conv.pinned);

    const openInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Helper function to format change values
    const formatChangeValue = (change: number | string) => {
        if (change === 'N/A') return 'N/A';
        return `${change}%`;
    };

    return (
        <>
            <Head title="Public AI Conversations - All Slugs" />
            
            <style>{`
                .react-tooltip {
                    z-index: 99999 !important;
                    opacity: 1 !important;
                    font-size: 12px;
                    padding: 4px 8px;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slide-in-from-bottom-2 {
                    from { transform: translateY(0.5rem); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes pulse-slow {
                    0%, 100% {
                        box-shadow: 0 10px 25px -5px rgba(251, 191, 36, 0.3);
                    }
                    50% {
                        box-shadow: 0 20px 30px -5px rgba(251, 191, 36, 0.5);
                    }
                }
                
                .animate-in {
                    animation-duration: 0.3s;
                    animation-fill-mode: both;
                }
                
                .fade-in {
                    animation-name: fade-in;
                }
                
                .slide-in-from-bottom-2 {
                    animation-name: slide-in-from-bottom-2;
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 2s infinite;
                }
                
                .conversation-card:hover {
                    border-color: #fbbf24;
                    box-shadow: 0 8px 20px -6px rgba(251, 191, 36, 0.15);
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1f2937;
                    border-radius: 20px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4b5563;
                    border-radius: 20px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #6b7280;
                }
                
                button, .card-transition {
                    transition: all 0.15s ease;
                }
            `}</style>

            <Tooltip 
                id="main-tooltip"
                place="top"
                className="!bg-gray-800 !text-white !text-xs !px-3 !py-2 !rounded-lg !z-[100] !shadow-xl border !border-gray-700"
                effect="solid"
            />
            
            <Tooltip id="action-tooltip" />
            <Tooltip id="dashboard-tooltip" />
            
            <div data-tooltip-id="action-tooltip" data-tooltip-content="Drag to move the main menu">
                <DraggableMenu auth={auth} />
            </div>
            
            <main className="relative flex justify-end p-4 min-h-screen overflow-hidden">
                
                {isPanelVisible && (
                    <div 
                        className="relative mt-4 mx-auto bottom-4 z-50 backdrop-blur-sm p-4 rounded-xl border border-white/20 overflow-y-auto shadow-2xl w-full bg-gray-900/80"
                        data-tooltip-id="dashboard-tooltip"
                        data-tooltip-content="This panel displays your public AI conversations"
                    >
                        <div className="space-y-6">
                            {/* Header Section - Dashboard Style */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-3">
                                            <FontAwesomeIcon icon={faChartLine} className="text-yellow-400 text-2xl" />
                                            <h1 className="text-2xl font-bold text-white">
                                                Public Conversations
                                            </h1>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Browse all public conversations. Each card links to a unique slug.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/"
                                            className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-black font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                                            data-tooltip-id="main-tooltip"
                                            data-tooltip-content="Go to home page to start a new conversation"
                                        >
                                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                                            <FontAwesomeIcon icon={faPlus} className="relative" />
                                            <span className="relative">New Conversation</span>
                                        </Link>
                                    </div>
                                </div>
                                
                                {/* Stats Overview - Dashboard Style */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                                    <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-400 font-medium text-sm uppercase tracking-wide">Total Conversations</p>
                                                <h3 className="text-3xl font-bold text-white mt-1">{totalConversations}</h3>
                                            </div>
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white shadow-md">
                                                <FontAwesomeIcon icon={faComment} className="text-2xl" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-400 font-medium text-sm uppercase tracking-wide">Total Messages</p>
                                                <h3 className="text-3xl font-bold text-white mt-1">{totalMessages}</h3>
                                            </div>
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                                <FontAwesomeIcon icon={faRobot} className="text-2xl" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-400 font-medium text-sm uppercase tracking-wide">Total Cost</p>
                                                <h3 className="text-3xl font-bold text-white mt-1">${formatCost(totalCost)}</h3>
                                            </div>
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md">
                                                <FontAwesomeIcon icon={faDollarSign} className="text-2xl" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 border border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-400 font-medium text-sm uppercase tracking-wide">Pinned</p>
                                                <h3 className="text-3xl font-bold text-white mt-1">{conversations.filter(c => c.pinned).length}</h3>
                                            </div>
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-md">
                                                <FontAwesomeIcon icon={faThumbtack} className="text-2xl" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Search Bar - Dashboard Style */}
                                <div className="mt-6 relative group">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by title, query, response, or email..."
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-800/80 backdrop-blur-sm border-2 border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400/50 transition-all duration-300 text-white placeholder-gray-500 shadow-sm hover:shadow-md"
                                        data-tooltip-id="main-tooltip"
                                        data-tooltip-content="Type to filter conversations by title, content, or user email"
                                    />
                                    <FontAwesomeIcon 
                                        icon={faSearch}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-400 transition-colors duration-300"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
                                            data-tooltip-id="main-tooltip"
                                            data-tooltip-content="Clear search"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="text-sm" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Conversation Grid */}
                            {filteredConversations.length === 0 ? (
                                <div className="text-center py-20 bg-gray-800/80 backdrop-blur-sm rounded-3xl border-2 border-gray-700 shadow-sm">
                                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 16v-4M12 8h.01"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {searchQuery ? 'No matches found' : 'No conversations yet'}
                                    </h3>
                                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                        {searchQuery 
                                            ? `No conversations match "${searchQuery}". Try different keywords.`
                                            : 'Be the first to start a conversation!'}
                                    </p>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black rounded-xl text-sm font-bold transition shadow-lg shadow-yellow-400/20 hover:shadow-xl hover:shadow-yellow-400/30 hover:-translate-y-0.5 duration-200"
                                        data-tooltip-id="main-tooltip"
                                        data-tooltip-content="Go to home page to start a new conversation"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                        Start a Conversation
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                                        <p className="text-sm text-gray-500">
                                            Showing <span className="font-medium text-gray-300">{filteredConversations.length}</span> of{' '}
                                            <span className="font-medium text-gray-300">{totalConversations}</span> conversations
                                            {pinnedConversations.length > 0 && (
                                                <span className="ml-2 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/30">
                                                    <FontAwesomeIcon icon={faThumbtack} className="mr-1 text-xs" />
                                                    {pinnedConversations.length} pinned
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500">Slug:</span>
                                            <span 
                                                className="text-xs bg-gray-700/50 px-2 py-1 rounded-md text-gray-400 border border-gray-600 font-mono"
                                                data-tooltip-id="main-tooltip"
                                                data-tooltip-content="Each conversation has a unique URL slug"
                                            >
                                                /X/your-slug
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Pinned conversations section */}
                                        {pinnedConversations.length > 0 && (
                                            <>
                                                <div className="col-span-full mb-2 mt-2">
                                                    <h2 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faThumbtack} />
                                                        <span>Pinned Conversations</span>
                                                        <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/30">
                                                            {pinnedConversations.length}
                                                        </span>
                                                    </h2>
                                                </div>
                                                
                                                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                                                    {pinnedConversations.map((conversation, index) => (
                                                        <ConversationCard 
                                                            key={conversation.conversation_id}
                                                            conversation={conversation}
                                                            index={index}
                                                            isPinned={true}
                                                            onOpenInNewTab={openInNewTab}
                                                        />
                                                    ))}
                                                </div>
                                                
                                                {unpinnedConversations.length > 0 && (
                                                    <div className="col-span-full my-4 border-t border-dashed border-gray-700"></div>
                                                )}
                                            </>
                                        )}
                                        
                                        {/* Unpinned conversations section */}
                                        {unpinnedConversations.length > 0 && (
                                            <>
                                                {pinnedConversations.length > 0 && (
                                                    <div className="col-span-full mb-2">
                                                        <h2 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                                                            <span>All Conversations</span>
                                                            <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full border border-gray-600">
                                                                {unpinnedConversations.length}
                                                            </span>
                                                        </h2>
                                                    </div>
                                                )}
                                                
                                                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {unpinnedConversations.map((conversation, index) => (
                                                        <ConversationCard 
                                                            key={conversation.conversation_id}
                                                            conversation={conversation}
                                                            index={pinnedConversations.length + index}
                                                            isPinned={false}
                                                            onOpenInNewTab={openInNewTab}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Load More */}
                            <div ref={loaderRef} className="py-12 text-center">
                                {loading && (
                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/80 backdrop-blur-sm border-2 border-gray-700 rounded-2xl shadow-sm">
                                        <LoadingSpinner size={22} />
                                        <span className="text-sm font-medium text-gray-300">Loading more conversations...</span>
                                    </div>
                                )}
                                {!hasMore && conversations.length > 0 && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-gray-600" />
                                        <span>You've reached the end</span>
                                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-gray-600" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-700 pt-8">
                                <p>Showing all public conversations. Total slugs available: {totalConversations}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Coming Soon Modal - Updated with Dashboard Style */}
            {comingSoonModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/70 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className={`px-6 py-5 rounded-t-2xl bg-gradient-to-r ${
                            comingSoonModal.iconColor === 'purple' ? 'from-purple-600 to-purple-700' :
                            comingSoonModal.iconColor === 'blue' ? 'from-blue-600 to-blue-700' :
                            comingSoonModal.iconColor === 'green' ? 'from-green-600 to-green-700' :
                            'from-yellow-500 to-amber-600'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                        {comingSoonModal.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-bold text-white truncate">{comingSoonModal.feature}</h3>
                                        <div className="flex items-center space-x-2 mt-1 flex-wrap">
                                            <span className="px-2 py-0.5 bg-white/30 rounded-full text-xs font-semibold text-white whitespace-nowrap">
                                                Coming Soon
                                            </span>
                                            <span className="text-white/80 text-xs whitespace-nowrap">• Pre-alpha</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={closeComingSoonModal}
                                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
                                    aria-label="Close modal"
                                    data-tooltip-id="main-tooltip"
                                    data-tooltip-content="Close modal"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-yellow-400 mb-2">✨ What's coming?</h4>
                                <p className="text-gray-300 leading-relaxed break-words">
                                    {comingSoonModal.description}
                                </p>
                            </div>
                            
                            <div className="bg-gray-700/30 rounded-xl p-4 mb-6 border border-gray-600">
                                <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">Early Preview</h4>
                                <div className="space-y-2">
                                    {comingSoonModal.feature === 'Analytics' && (
                                        <>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Real-time click tracking and analytics</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Geographic heatmaps and device insights</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Custom reports and exportable data</span>
                                            </div>
                                        </>
                                    )}
                                    {comingSoonModal.feature === 'Collections' && (
                                        <>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Create and organize custom collections</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Add notes, tags, and custom metadata</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Share collections with team members</span>
                                            </div>
                                        </>
                                    )}
                                    {comingSoonModal.feature === 'Bookmarks' && (
                                        <>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Save and organize favorite links</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Cross-device synchronization</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Folder organization and search</span>
                                            </div>
                                        </>
                                    )}
                                    {comingSoonModal.feature === 'QR Scanner' && (
                                        <>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Scan QR codes directly from your browser</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Generate and share QR codes instantly</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-400" />
                                                <span>Scan history and quick access</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        closeComingSoonModal();
                                        setTimeout(() => {
                                            alert(`You'll be notified when ${comingSoonModal.feature} launches!`);
                                        }, 100);
                                    }}
                                    className={`flex-1 px-4 py-3 ${
                                        comingSoonModal.iconColor === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
                                        comingSoonModal.iconColor === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                                        comingSoonModal.iconColor === 'green' ? 'bg-green-500 hover:bg-green-600' :
                                        'bg-yellow-400 hover:bg-yellow-500'
                                    } text-black font-bold rounded-xl transition-colors flex items-center justify-center space-x-2`}
                                    data-tooltip-id="main-tooltip"
                                    data-tooltip-content="Get notified when this feature launches"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                    </svg>
                                    <span>Notify Me</span>
                                </button>
                                
                                <button
                                    onClick={closeComingSoonModal}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-colors border border-gray-600"
                                    data-tooltip-id="main-tooltip"
                                    data-tooltip-content="Close this modal"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                        
                        <div className="px-6 py-3 bg-gray-700/30 border-t border-gray-600 rounded-b-2xl">
                            <p className="text-xs text-gray-500 text-center flex items-center justify-center space-x-1">
                                <span>🚧</span>
                                <span>We're working hard to bring you this feature. Stay tuned for updates!</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ConversationCard component with Dashboard Theme Styling
const ConversationCard = ({ 
    conversation, 
    index, 
    isPinned, 
    onOpenInNewTab 
}: { 
    conversation: Conversation; 
    index: number; 
    isPinned: boolean;
    onOpenInNewTab: (url: string) => void;
}) => {
    const handleCardClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onOpenInNewTab(`/X/${conversation.slug}`);
    };

    const handleViewButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenInNewTab(`/X/${conversation.slug}`);
    };

    const getModelIcon = (model: string) => {
        if (model.includes('kimi')) {
            return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
            );
        }
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8M8 12h8"/>
            </svg>
        );
    };

    return (
        <div
            className={`group bg-gradient-to-br from-gray-900/70 to-gray-800/70 border-2 rounded-2xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 relative cursor-pointer ${
                isPinned 
                    ? 'border-yellow-400/50 hover:border-yellow-400 shadow-lg shadow-yellow-400/10 hover:shadow-yellow-400/20' 
                    : 'border-gray-700 hover:border-yellow-400/30 shadow-sm hover:shadow-lg hover:shadow-yellow-400/5'
            } p-6`}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={handleCardClick}
        >
            {/* Pinned badge */}
            {isPinned && (
                <div className="mb-4 flex justify-between items-center">
                    <span 
                        className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-400 text-xs px-2.5 py-1 rounded-full border border-yellow-400/30"
                        data-tooltip-id="main-tooltip"
                        data-tooltip-content={`Pinned conversation ${conversation.pinned_order ? `#${conversation.pinned_order}` : ''}`}
                    >
                        <FontAwesomeIcon icon={faThumbtack} className="text-xs" />
                        {!conversation.pinned_order && <span className="ml-1">Pinned</span>}
                    </span>
                </div>
            )}
            
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div 
                            className={`flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                            data-tooltip-id="main-tooltip"
                            data-tooltip-content={`Model: ${conversation.model}`}
                        >
                            {getModelIcon(conversation.model)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 
                                className="text-lg font-semibold text-white truncate"
                                data-tooltip-id="main-tooltip"
                                data-tooltip-content={conversation.conversation_title || 'Untitled Conversation'}
                            >
                                {conversation.conversation_title || 'Untitled Conversation'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
                                <span 
                                    className="text-gray-500"
                                    data-tooltip-id="main-tooltip"
                                    data-tooltip-content={`Created at: ${conversation.created_at}`}
                                >
                                    {conversation.created_at_formatted}
                                </span>
                                {conversation.user_email && (
                                    <>
                                        <span className="text-gray-600">•</span>
                                        <div 
                                            className="flex items-center gap-1 text-gray-500"
                                            data-tooltip-id="main-tooltip"
                                            data-tooltip-content={`User: ${maskEmail(conversation.user_email)}`}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="text-xs" />
                                            <span className="truncate max-w-[120px]" title={maskEmail(conversation.user_email)}>
                                                {maskEmail(conversation.user_email)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div 
                    className="text-gray-300 h-[150px] font-medium overflow-hidden text-sm leading-relaxed"
                    data-tooltip-id="main-tooltip"
                    data-tooltip-content={conversation.query}
                >
                    <div className="line-clamp-6">
                        {conversation.query}
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span 
                        className="inline-flex items-center gap-1.5 bg-gray-700/50 rounded-lg text-gray-400 px-3 py-1.5 border border-gray-600"
                        data-tooltip-id="main-tooltip"
                        data-tooltip-content={`${conversation.message_count} messages in this conversation`}
                    >
                        <FontAwesomeIcon icon={faComment} className="text-xs" />
                        <span>{conversation.message_count} msg</span>
                    </span>
                    
                    <span 
                        className="inline-flex items-center gap-1.5 bg-yellow-400/10 rounded-lg text-yellow-400 px-3 py-1.5 border border-yellow-400/30"
                        data-tooltip-id="main-tooltip"
                        data-tooltip-content={`Cost: $${formatCost(conversation.conversation_cost)}`}
                    >
                        <FontAwesomeIcon icon={faDollarSign} className="text-xs" />
                        <span>${formatCost(conversation.conversation_cost)}</span>
                    </span>
                    
                    <span 
                        className="inline-flex items-center gap-1.5 bg-blue-500/10 rounded-lg text-blue-400 px-3 py-1.5 border border-blue-500/30"
                        data-tooltip-id="main-tooltip"
                        data-tooltip-content={`Language: ${getLanguageLabel(conversation.language)}`}
                    >
                        <FontAwesomeIcon icon={faGlobe} className="text-xs" />
                        <span>{getLanguageLabel(conversation.language)}</span>
                    </span>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <span 
                            className="text-gray-500 flex items-center gap-1 text-xs font-mono"
                            data-tooltip-id="main-tooltip"
                            data-tooltip-content={`Full slug: /X/${conversation.slug}`}
                        >
                            <FontAwesomeIcon icon={faHashtag} className="text-xs" />
                            /X/{conversation.slug.substring(0, 25)}...
                        </span>
                        <button
                            onClick={handleViewButtonClick}
                            className="font-medium text-yellow-400 inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200 text-sm hover:text-yellow-300"
                            data-tooltip-id="main-tooltip"
                            data-tooltip-content="View full conversation (opens in new tab)"
                        >
                            View
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};