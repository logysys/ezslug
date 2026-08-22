import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPaperPlane, 
    faSpinner, 
    faCheck, 
    faReply, 
    faTimes,
    faComment,
    faImage
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import SocialMediaComposer from './SocialMediaComposer';

export type ReactionType = 'like' | 'love' | 'care' | 'haha' | 'wow' | 'sad' | 'angry';

export interface ReactionConfig {
    type: ReactionType;
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
}

export const REACTION_CONFIGS: Record<ReactionType, ReactionConfig> = {
    like: {
        type: 'like',
        label: 'Like',
        color: '#1877F2',
        bgColor: 'bg-[#1877F2]',
        textColor: 'text-[#1877F2]',
    },
    love: {
        type: 'love',
        label: 'Love',
        color: '#FA3E3E',
        bgColor: 'bg-[#FA3E3E]',
        textColor: 'text-[#FA3E3E]',
    },
    care: {
        type: 'care',
        label: 'Care',
        color: '#F7B125',
        bgColor: 'bg-[#F7B125]',
        textColor: 'text-[#F7B125]',
    },
    haha: {
        type: 'haha',
        label: 'Haha',
        color: '#F7B125',
        bgColor: 'bg-[#F7B125]',
        textColor: 'text-[#F7B125]',
    },
    wow: {
        type: 'wow',
        label: 'Wow',
        color: '#F7B125',
        bgColor: 'bg-[#F7B125]',
        textColor: 'text-[#F7B125]',
    },
    sad: {
        type: 'sad',
        label: 'Sad',
        color: '#F7B125',
        bgColor: 'bg-[#F7B125]',
        textColor: 'text-[#F7B125]',
    },
    angry: {
        type: 'angry',
        label: 'Angry',
        color: '#E02447',
        bgColor: 'bg-[#E02447]',
        textColor: 'text-[#E02447]',
    },
};

export const ReactionEmoji: React.FC<{ type: ReactionType; size?: 'sm' | 'md' | 'lg' }> = ({ type, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-7 h-7',
        lg: 'w-9 h-9'
    }[size];

    switch (type) {
        case 'like':
            return (
                <div className={`${sizeClasses} rounded-full bg-gradient-to-b from-[#1877F2] to-[#0D65D9] flex items-center justify-center shadow-sm flex-shrink-0 select-none`}>
                    <svg className="w-[58%] h-[58%] text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                </div>
            );
        case 'love':
            return (
                <div className={`${sizeClasses} rounded-full bg-gradient-to-b from-[#FA3E3E] to-[#E02447] flex items-center justify-center shadow-sm flex-shrink-0 select-none`}>
                    <svg className="w-[58%] h-[58%] text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </div>
            );
        case 'care':
            return (
                <div className={`${sizeClasses} rounded-full bg-gradient-to-b from-[#FFD966] to-[#F59E0B] flex items-center justify-center shadow-sm flex-shrink-0 select-none overflow-hidden relative`}>
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle fill="#FFCC4D" cx="18" cy="18" r="18"/>
                        <path fill="#664500" d="M10 13c1.2-1 2.8-1 4 0M22 13c1.2-1 2.8-1 4 0" stroke="#664500" strokeWidth="1.8" strokeLinecap="round"/>
                        <ellipse fill="#664500" cx="12" cy="15" rx="1.8" ry="2.2"/>
                        <ellipse fill="#664500" cx="24" cy="15" rx="1.8" ry="2.2"/>
                        <path fill="#664500" d="M14 21c1.2 1.5 2.8 2 4 2s2.8-.5 4-2" stroke="#664500" strokeWidth="1.8" strokeLinecap="round"/>
                        <path fill="#E02447" d="M18 28.5c-3-3.2-6-5.8-6-8.5 0-2 1.5-3.5 3.5-3.5 1.2 0 2.3.6 3 1.6.7-1 1.8-1.6 3-1.6 2 0 3.5 1.5 3.5 3.5 0 2.7-3 5.3-6 8.5z"/>
                        <path fill="#FFD966" stroke="#E59400" strokeWidth="1" d="M10 24c1.5-1 3.5 0 4 1.5M26 24c-1.5-1-3.5 0-4 1.5"/>
                    </svg>
                </div>
            );
        case 'haha':
            return (
                <div className={`${sizeClasses} rounded-full bg-gradient-to-b from-[#FFD966] to-[#F59E0B] flex items-center justify-center shadow-sm flex-shrink-0 select-none`}>
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle fill="#FFCC4D" cx="18" cy="18" r="18"/>
                        <path fill="none" stroke="#664500" strokeWidth="2.4" strokeLinecap="round" d="M8.5 13.5c2-2 4.5-2 6.5 0M21 13.5c2-2 4.5-2 6.5 0"/>
                        <path fill="#664500" d="M8 19.5c0 5.5 4.5 9.5 10 9.5s10-4 10-9.5H8z"/>
                        <path fill="#FF7088" d="M13 25c1.2 1.5 3 2 5 2s3.8-.5 5-2c0 0-2 2.5-5 2.5s-5-2.5-5-2.5z"/>
                    </svg>
                </div>
            );
        case 'wow':
            return (
                <div className={`${sizeClasses} rounded-full bg-gradient-to-b from-[#FFD966] to-[#F59E0B] flex items-center justify-center shadow-sm flex-shrink-0 select-none`}>
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle fill="#FFCC4D" cx="18" cy="18" r="18"/>
                        <path fill="none" stroke="#664500" strokeWidth="1.8" strokeLinecap="round" d="M9 9c2-2 5-2 7 0M20 9c2-2 5-2 7 0"/>
                        <ellipse fill="#664500" cx="12" cy="14" rx="2.4" ry="3.2"/>
                        <ellipse fill="#664500" cx="24" cy="14" rx="2.4" ry="3.2"/>
                        <ellipse fill="#664500" cx="18" cy="24" rx="4" ry="5.5"/>
                    </svg>
                </div>
            );
        case 'sad':
            return (
                <div className={`${sizeClasses} rounded-full bg-gradient-to-b from-[#FFD966] to-[#F59E0B] flex items-center justify-center shadow-sm flex-shrink-0 select-none`}>
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle fill="#FFCC4D" cx="18" cy="18" r="18"/>
                        <path fill="none" stroke="#664500" strokeWidth="1.8" strokeLinecap="round" d="M9 11c2 1 4 0 5-1M27 11c-2 1-4 0-5-1"/>
                        <ellipse fill="#664500" cx="11.5" cy="15.5" rx="2.2" ry="2.8"/>
                        <ellipse fill="#664500" cx="24.5" cy="15.5" rx="2.2" ry="2.8"/>
                        <path fill="none" stroke="#664500" strokeWidth="2.2" strokeLinecap="round" d="M13 25c1.5-2 3.2-2.8 5-2.8s3.5.8 5 2.8"/>
                        <path fill="#55ACEE" d="M25 21.5c0 1.8-1.4 3-2.5 3s-2.5-1.2-2.5-3c0-1.5 2.5-4.5 2.5-4.5s2.5 3 2.5 4.5z"/>
                    </svg>
                </div>
            );
        case 'angry':
            return (
                <div className={`${sizeClasses} rounded-full bg-gradient-to-b from-[#F2522B] to-[#D9381E] flex items-center justify-center shadow-sm flex-shrink-0 select-none`}>
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle fill="#D9381E" cx="18" cy="18" r="18"/>
                        <path fill="none" stroke="#262626" strokeWidth="2.2" strokeLinecap="round" d="M8.5 12l6 3.5M27.5 12l-6 3.5"/>
                        <ellipse fill="#FFFFFF" cx="12" cy="17" rx="2.5" ry="3"/>
                        <circle fill="#000000" cx="12.5" cy="17" r="1.4"/>
                        <ellipse fill="#FFFFFF" cx="24" cy="17" rx="2.5" ry="3"/>
                        <circle fill="#000000" cx="23.5" cy="17" r="1.4"/>
                        <path fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" d="M12.5 26c1.8-2 3.5-2.8 5.5-2.8s3.7.8 5.5 2.8"/>
                    </svg>
                </div>
            );
    }
};

interface MessageReactionsBarProps {
    messageId: number;
    messageSlug: string;
    initialLikes?: number;
    initialComments?: number;
    initialReactions?: Record<string, number>;
    onAddComment?: (text: string) => Promise<void> | void;
    tooltips?: Record<string, string>;
    conversationId?: string | null;
    parentSlug?: string | null;
    currentUser?: any | null;
    // Reply handlers
    onReplyPost?: (content: string, mediaFiles: string[], cw: string | null) => Promise<void>;
    onReplyAskAI?: (question: string) => Promise<void>;
}

export const MessageReactionsBar: React.FC<MessageReactionsBarProps> = ({
    messageId,
    messageSlug,
    initialLikes = 0,
    initialComments = 0,
    initialReactions = {},
    onAddComment,
    tooltips,
    conversationId = null,
    parentSlug = null,
    currentUser = null,
    onReplyPost,
    onReplyAskAI
}) => {
    // Check if user is logged in
    const isLoggedIn = !!currentUser;
    
    // State for reactions from database
    const [counts, setCounts] = useState<{
        total: number;
        breakdown: Record<ReactionType, number>;
        comments: number;
    }>({
        total: initialLikes || 0,
        breakdown: {
            like: initialReactions.like || Math.max(0, Math.round((initialLikes || 0) * 0.65)),
            love: initialReactions.love || Math.max(0, Math.round((initialLikes || 0) * 0.20)),
            care: initialReactions.care || Math.max(0, Math.round((initialLikes || 0) * 0.08)),
            haha: initialReactions.haha || Math.max(0, Math.round((initialLikes || 0) * 0.04)),
            wow: initialReactions.wow || Math.max(0, Math.round((initialLikes || 0) * 0.02)),
            sad: initialReactions.sad || 0,
            angry: initialReactions.angry || 0,
        },
        comments: initialComments || 0,
    });

    const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPopover, setShowPopover] = useState(false);
    const [isHoveringPopover, setIsHoveringPopover] = useState(false);
    const [hoveredReaction, setHoveredReaction] = useState<ReactionType | null>(null);
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isShareCopied, setIsShareCopied] = useState(false);

    // Reply composer state - matches bottom UI
    const [replyActiveTab, setReplyActiveTab] = useState<'social' | 'text'>('social');
    const [replyContentSubTab, setReplyContentSubTab] = useState<'composer' | 'upload' | 'embed'>('composer');
    const [replyContentFormat, setReplyContentFormat] = useState<'markdown' | 'html'>('markdown');
    const [replyQuestion, setReplyQuestion] = useState('');

    // Show login prompt state
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const likeButtonRef = useRef<HTMLDivElement | null>(null);
    const isMounted = useRef(true);

    const reactionTypes: ReactionType[] = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'];

    // Fetch reactions from database
    const fetchReactions = useCallback(async () => {
        if (!messageId) {
            setIsLoading(false);
            return;
        }
        
        if (!isLoggedIn) {
            setIsLoading(false);
            setUserReaction(null);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/reactions/${messageId}`);
            if (response.data.success && isMounted.current) {
                const data = response.data.data;
                const breakdown = {
                    like: data.breakdown?.like || 0,
                    love: data.breakdown?.love || 0,
                    care: data.breakdown?.care || 0,
                    haha: data.breakdown?.haha || 0,
                    wow: data.breakdown?.wow || 0,
                    sad: data.breakdown?.sad || 0,
                    angry: data.breakdown?.angry || 0,
                };
                setCounts(prev => ({
                    ...prev,
                    total: data.total || 0,
                    breakdown: breakdown,
                }));
                setUserReaction(data.user_reaction || null);
            }
        } catch (error) {
            console.error('Error fetching reactions:', error);
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [messageId, isLoggedIn]);

    useEffect(() => {
        fetchReactions();
        return () => {
            isMounted.current = false;
        };
    }, [fetchReactions]);

    // Handle selecting a reaction
    const handleSelectReaction = async (type: ReactionType) => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            return;
        }
        
        if (!messageId) return;

        const prevUserReaction = userReaction;
        const prevCounts = { ...counts };
        
        let newUserReaction: ReactionType | null;
        let newBreakdown = { ...counts.breakdown };
        let newTotal = counts.total;

        if (prevUserReaction === type) {
            newUserReaction = null;
            newBreakdown[type] = Math.max(0, (newBreakdown[type] || 0) - 1);
            newTotal = Math.max(0, newTotal - 1);
        } else {
            if (prevUserReaction) {
                newBreakdown[prevUserReaction] = Math.max(0, (newBreakdown[prevUserReaction] || 0) - 1);
            } else {
                newTotal += 1;
            }
            newBreakdown[type] = (newBreakdown[type] || 0) + 1;
            newUserReaction = type;
        }

        setCounts(prev => ({
            ...prev,
            total: newTotal,
            breakdown: newBreakdown,
        }));
        setUserReaction(newUserReaction);

        try {
            const response = await axios.post('/api/reactions/toggle', {
                message_id: messageId,
                message_slug: messageSlug,
                reaction_type: type,
            });

            if (response.data.success && isMounted.current) {
                const data = response.data.data;
                setCounts(prev => ({
                    ...prev,
                    total: data.total || 0,
                    breakdown: data.breakdown || prev.breakdown,
                }));
                setUserReaction(data.user_reaction || null);
            }
        } catch (error) {
            console.error('Error toggling reaction:', error);
            setCounts(prevCounts);
            setUserReaction(prevUserReaction);
        }

        setShowPopover(false);
        setHoveredReaction(null);
    };

    const handleDefaultLikeClick = () => {
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
            return;
        }
        
        if (userReaction) {
            handleSelectReaction(userReaction);
        } else {
            handleSelectReaction('like');
        }
    };

    const handleShareClick = async () => {
        const url = `${window.location.origin}/X/${encodeURIComponent(messageSlug)}`;
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                setIsShareCopied(true);
                setTimeout(() => setIsShareCopied(false), 2000);
            }
        } catch {
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setIsShareCopied(true);
            setTimeout(() => setIsShareCopied(false), 2000);
        }
    };

    // Handle reply via the enhanced composer (Social & Upload)
    const handleReplyPost = async (content: string, mediaFiles: string[], cw: string | null) => {
        if (!content.trim() && mediaFiles.length === 0) return;
        
        setIsSubmitting(true);
        try {
            if (onReplyPost) {
                await onReplyPost(content, mediaFiles, cw);
                // Close the reply box after successful post
                setShowReplyBox(false);
                // Reset tabs
                setReplyActiveTab('social');
                setReplyContentSubTab('composer');
            } else if (onAddComment) {
                // Fallback to simple comment
                await onAddComment(content);
                setShowReplyBox(false);
            }
        } catch (err) {
            console.error('Error posting reply:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle AI question reply
    const handleAskAI = async () => {
        if (!replyQuestion.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            if (onReplyAskAI) {
                await onReplyAskAI(replyQuestion);
                setReplyQuestion('');
                // Close the reply box after successful post
                setShowReplyBox(false);
                setReplyActiveTab('social');
                setReplyContentSubTab('composer');
            } else if (onAddComment) {
                // Fallback to simple comment
                await onAddComment(replyQuestion);
                setReplyQuestion('');
                setShowReplyBox(false);
            }
        } catch (err) {
            console.error('Error asking AI:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMouseEnterLike = () => {
        if (popoverTimeoutRef.current) {
            clearTimeout(popoverTimeoutRef.current);
        }
        if (isLoggedIn) {
            setShowPopover(true);
        }
    };

    const handleMouseLeaveLike = () => {
        popoverTimeoutRef.current = setTimeout(() => {
            if (!isHoveringPopover) {
                setShowPopover(false);
                setHoveredReaction(null);
            }
        }, 300);
    };

    const topReactions = Object.entries(counts.breakdown)
        .filter(([_, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([type]) => type as ReactionType)
        .slice(0, 3);

    const activeConfig = userReaction ? REACTION_CONFIGS[userReaction] : null;

    // Render the enhanced reply composer (matches bottom UI)
    const renderReplyComposer = () => {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-3">
                {/* Tabs */}
                <div className="flex items-center gap-2 p-2 sm:p-4 border-b border-gray-200 overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap">
                    <button
                        onClick={() => {
                            setReplyActiveTab('social');
                            setReplyContentSubTab('composer');
                        }}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
                            replyActiveTab === 'social'
                                ? 'bg-[#22c55e] text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center space-x-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                            </svg>
                            <span>Social & Upload</span>
                        </div>
                    </button>
                    
                    <button
                        onClick={() => setReplyActiveTab('text')}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
                            replyActiveTab === 'text'
                                ? 'bg-[#22c55e] text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center space-x-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v8H3v-8a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-1.01-1-1.73a2 2 0 0 1 2-2Z"/>
                                <path d="M9 12h6"/>
                                <path d="M12 9v6"/>
                            </svg>
                            <span>Ask AI</span>
                        </div>
                    </button>
                </div>

                <div className="p-6">
                    {replyActiveTab === 'social' ? (
                        <div className="space-y-4">
                            {/* Sub-tabs */}
                            <div className="flex flex-wrap items-center gap-2 mb-3 border-b border-gray-200 pb-3">
                                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => {
                                            setReplyContentFormat('markdown');
                                            setReplyContentSubTab('composer');
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                            replyContentFormat === 'markdown'
                                                ? 'bg-white text-gray-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        Markdown
                                    </button>
                                    <button
                                        onClick={() => {
                                            setReplyContentFormat('html');
                                            setReplyContentSubTab('composer');
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                            replyContentFormat === 'html'
                                                ? 'bg-white text-gray-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        HTML
                                    </button>
                                </div>
                                
                                <div className="h-6 w-px bg-gray-200" />
                                
                                <button
                                    onClick={() => setReplyContentSubTab('upload')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                        replyContentSubTab === 'upload'
                                            ? 'bg-[#22c55e] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    Upload Media
                                </button>
                                
                                <button
                                    onClick={() => setReplyContentSubTab('embed')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                        replyContentSubTab === 'embed'
                                            ? 'bg-[#22c55e] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                    </svg>
                                    Embed Content
                                </button>
                            </div>

                            {replyContentSubTab === 'upload' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#22c55e]">
                                            <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Upload Files</span>
                                        <span className="text-xs text-gray-400">• Images, PDF, Video, Audio, HTML up to 100MB</span>
                                    </div>
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#22c55e] transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-[#22c55e]">Click to upload</span> or drag & drop
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                ✅ Images (JPG, PNG, GIF, WEBP) • PDF • Video (MP4, WEBM, OGG) • Audio (MP3, WAV, OGG) • HTML
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">Max size: 100MB</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*,.pdf,video/*,audio/*,.mp4,.webm,.ogg,.mp3,.wav,.mov,.avi,.m4a,.html,.htm" />
                                    </div>
                                    <button
                                        onClick={() => handleReplyPost('Uploaded file', [], null)}
                                        disabled={isSubmitting}
                                        className="w-full px-4 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/>
                                                </svg>
                                                <span>Upload File</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : replyContentSubTab === 'embed' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#22c55e]">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Embed Content</span>
                                    </div>
                                    <SocialMediaComposer
                                        onPost={handleReplyPost}
                                        className="w-full"
                                        conversationId={conversationId}
                                        contentFormat={replyContentFormat}
                                    />
                                </div>
                            ) : (
                                <SocialMediaComposer
                                    onPost={handleReplyPost}
                                    className="w-full"
                                    conversationId={conversationId}
                                    contentFormat={replyContentFormat}
                                />
                            )}
                        </div>
                    ) : (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAskAI();
                        }}>
                            <div className="relative">
                                <textarea
                                    value={replyQuestion}
                                    onChange={(e) => setReplyQuestion(e.target.value)}
                                    placeholder="Ask a follow-up question... (Press Enter to send, Shift+Enter for new line)"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 pr-32 text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e] min-h-[100px] resize-y"
                                    rows={3}
                                    disabled={isSubmitting}
                                />
                                
                                <div className="absolute bottom-3 right-16">
                                    <button
                                        type="submit"
                                        disabled={!replyQuestion.trim() || isSubmitting}
                                        className="px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                                <span>Asking...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v8H3v-8a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-1.01-1-1.73a2 2 0 0 1 2-2Z"/>
                                                    <path d="M9 12h6"/>
                                                    <path d="M12 9v6"/>
                                                </svg>
                                                <span>Ask AI</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-4">
                                    <span>Press Enter to send</span>
                                    <span>•</span>
                                    <span>Shift+Enter for new line</span>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    if (isLoading && counts.total === 0) {
        return (
            <div className="w-full mt-2 pt-2 border-t border-gray-100/80">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin w-3 h-3" />
                    <span>Loading reactions...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mt-2 pt-2 border-t border-gray-100/80">
            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div 
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setShowLoginPrompt(false)}
                    />
                    
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                            
                            <div className="mb-6 text-center">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M12 8v4"/>
                                        <path d="M12 16h.01"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Login Required
                                </h3>
                                <p className="text-gray-600">Please log in to react to messages.</p>
                            </div>
                            
                            <div className="space-y-3">
                                <a href="/login" className="block w-full px-4 py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg transition-colors font-medium text-center">
                                    Log In
                                </a>
                                <a href="/register" className="block w-full px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium text-center">
                                    Create Account
                                </a>
                                <button onClick={() => setShowLoginPrompt(false)} className="block w-full px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors font-medium text-center">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Action Bar */}
            <div className="flex items-center justify-between text-xs select-none">
                <div className="flex items-center gap-3">
                    {/* Like Button */}
                    <div 
                        ref={likeButtonRef}
                        className="relative"
                        onMouseEnter={handleMouseEnterLike}
                        onMouseLeave={handleMouseLeaveLike}
                    >
                        {showPopover && isLoggedIn && (
                            <div 
                                className="absolute bottom-full left-0 mb-2 z-40 bg-white/95 backdrop-blur-sm rounded-full py-1 px-2 shadow-2xl border border-gray-200/80 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150"
                                onMouseEnter={() => {
                                    if (popoverTimeoutRef.current) clearTimeout(popoverTimeoutRef.current);
                                    setIsHoveringPopover(true);
                                }}
                                onMouseLeave={() => {
                                    setIsHoveringPopover(false);
                                    setShowPopover(false);
                                    setHoveredReaction(null);
                                }}
                            >
                                {reactionTypes.map((type) => {
                                    const isHovered = hoveredReaction === type;
                                    const isCurrent = userReaction === type;
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectReaction(type);
                                            }}
                                            onMouseEnter={() => setHoveredReaction(type)}
                                            className={`relative p-1 rounded-full transition-all duration-150 transform hover:-translate-y-1.5 hover:scale-125 focus:outline-none ${
                                                isCurrent ? 'ring-2 ring-[#22c55e] ring-offset-1 scale-110' : ''
                                            }`}
                                            title={REACTION_CONFIGS[type].label}
                                        >
                                            <ReactionEmoji type={type} size="md" />
                                            {isHovered && (
                                                <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white text-[10px] font-medium py-0.5 px-2 rounded-full whitespace-nowrap pointer-events-none shadow-md">
                                                    {REACTION_CONFIGS[type].label}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleDefaultLikeClick}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors focus:outline-none ${
                                userReaction && isLoggedIn
                                    ? `${activeConfig?.textColor || 'text-blue-600'} font-semibold bg-gray-50` 
                                    : 'text-gray-500 hover:text-[#22c55e] hover:bg-gray-50'
                            } ${!isLoggedIn ? 'cursor-pointer' : ''}`}
                        >
                            {userReaction && isLoggedIn ? (
                                <ReactionEmoji type={userReaction} size="sm" />
                            ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 10v12" />
                                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3" />
                                </svg>
                            )}
                            <span className="text-xs font-medium">
                                {counts.total > 0 ? counts.total : 'Like'}
                            </span>
                        </button>
                    </div>

                    {/* Comment Button - Opens the enhanced reply composer */}
                    <button
                        type="button"
                        onClick={() => {
                            if (!isLoggedIn) {
                                setShowLoginPrompt(true);
                                return;
                            }
                            setShowReplyBox(!showReplyBox);
                            if (!showReplyBox) {
                                setReplyActiveTab('social');
                                setReplyContentSubTab('composer');
                                setReplyQuestion('');
                            }
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors focus:outline-none ${
                            showReplyBox && isLoggedIn
                                ? 'text-[#22c55e] bg-green-50/60 font-semibold' 
                                : 'text-gray-500 hover:text-[#22c55e] hover:bg-gray-50'
                        }`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="text-xs font-medium">
                            {counts.comments > 0 ? counts.comments : 'Comment'}
                        </span>
                    </button>

                    {/* Share Button */}
                    <button
                        type="button"
                        onClick={handleShareClick}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors focus:outline-none ${
                            isShareCopied ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-[#22c55e] hover:bg-gray-50'
                        }`}
                    >
                        {isShareCopied ? (
                            <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 14 5-5-5-5" />
                                <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v2.5" />
                            </svg>
                        )}
                        <span className="text-xs font-medium">
                            {isShareCopied ? 'Copied' : 'Share'}
                        </span>
                    </button>
                </div>

                {/* Reaction Summary Badges */}
                {topReactions.length > 0 && counts.total > 0 && (
                    <div 
                        className="flex items-center gap-1 cursor-pointer group/summary"
                        onClick={() => {
                            if (!isLoggedIn) {
                                setShowLoginPrompt(true);
                                return;
                            }
                            handleMouseEnterLike();
                        }}
                    >
                        <div className="flex items-center -space-x-1.5">
                            {topReactions.map((type) => (
                                <div key={type} className="ring-1 ring-white rounded-full transition-transform group-hover/summary:scale-110">
                                    <ReactionEmoji type={type} size="sm" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500 group-hover/summary:text-gray-800 ml-1">
                            {counts.total}
                        </span>
                    </div>
                )}
            </div>

            {/* Enhanced Reply Composer */}
            {showReplyBox && isLoggedIn && renderReplyComposer()}
        </div>
    );
};

export default MessageReactionsBar;