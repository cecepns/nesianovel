import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { requiresChapterLogin } from '../utils/chapterAccess';
import LoginModal from './LoginModal';

export function getChapterAccessLinkClassName({
  locked,
  className = '',
  compact = false,
}) {
  const base = compact
    ? 'relative inline-flex max-w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-all md:text-sm'
    : 'relative flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-all sm:px-3';

  const unlocked = compact
    ? 'chapter-border-anim chapter-border-unlocked bg-[#0f0f14] text-slate-200 dark:bg-black dark:text-white'
    : 'chapter-border-anim chapter-border-unlocked bg-[#0f0f14] text-gray-200 dark:bg-black dark:text-white';

  const lockedCls = compact
    ? 'chapter-border-anim chapter-border-locked bg-black text-amber-50 dark:bg-black dark:text-amber-50'
    : 'chapter-border-anim chapter-border-locked bg-black text-gray-100 dark:bg-black dark:text-gray-100';

  return [base, locked ? lockedCls : unlocked, className].filter(Boolean).join(' ');
}

/* ── Visibility-aware animation engine ── */
let rafId = null;
const visibleElements = new Set();

function tick(timestamp) {
  const angle = `${(timestamp * 0.12) % 360}deg`;
  for (const el of visibleElements) {
    el.style.setProperty('--border-angle', angle);
  }
  rafId = requestAnimationFrame(tick);
}

function startLoop() {
  if (!rafId) rafId = requestAnimationFrame(tick);
}

function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

let sharedObserver = null;

function getObserver() {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('chapter-anim-visible');
            visibleElements.add(entry.target);
          } else {
            entry.target.classList.remove('chapter-anim-visible');
            visibleElements.delete(entry.target);
          }
        }
        if (visibleElements.size > 0) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { rootMargin: '200px 0px' },
    );
  }
  return sharedObserver;
}

function observeEl(el) {
  getObserver().observe(el);
}

function unobserveEl(el) {
  getObserver().unobserve(el);
  visibleElements.delete(el);
  el.classList.remove('chapter-anim-visible');
  if (visibleElements.size === 0) stopLoop();
}

const ChapterAccessLink = ({
  chapter,
  to,
  className = '',
  label,
  meta,
  accent = 'blue',
  compact = false,
  children,
  onClick,
  showLockIcon = true,
  ...rest
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  const isCoinLocked = Boolean(
    chapter?.is_locked === true || 
    chapter?.is_locked === 1 || 
    chapter?.is_locked === '1'
  );
  const isGuestTimeLocked = requiresChapterLogin(chapter, isAuthenticated);
  const isLocked = isGuestTimeLocked || isCoinLocked;

  const animRef = useRef(null);

  /* Observe / unobserve the animated element for viewport visibility */
  useEffect(() => {
    const el = animRef.current;
    if (!el) return;
    observeEl(el);
    return () => unobserveEl(el);
  }, [isLocked]);

  /* Block ALL event types from reaching parent card containers */
  const stopAllPropagation = (e) => {
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();

    // Guest trying to open a locked chapter -> prompt login modal
    if (!isAuthenticated && isLocked) {
      e.preventDefault();
      setLoginOpen(true);
      return;
    }
    onClick?.(e);
  };

  const linkClassName = getChapterAccessLinkClassName({
    locked: isLocked,
    className,
    compact,
  });

  const labelNode = label ?? children;

  const contentNode = label != null || meta != null ? (
    <>
      <span className="relative z-10 flex min-w-0 items-center gap-1.5 font-semibold">
        {isLocked ? (
          <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
        ) : (
          <span className="h-2 w-2 shrink-0 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
        )}
        <span className={`truncate ${isLocked ? 'text-amber-300 font-bold' : 'text-gray-200 dark:text-white'}`}>
          {label}
        </span>
      </span>
      {meta ? (
        <span className={`relative z-10 shrink-0 pl-2 text-[11px] md:text-xs ${isLocked ? 'text-amber-200/75' : 'text-gray-500 dark:text-gray-400'}`}>
          {meta}
        </span>
      ) : null}
    </>
  ) : (
    labelNode
  );

  // If locked and not authenticated, use button that triggers LoginModal
  if (isLocked && !isAuthenticated) {
    return (
      <div
        onClick={stopAllPropagation}
        onMouseDown={stopAllPropagation}
        onMouseUp={stopAllPropagation}
        onPointerDown={stopAllPropagation}
        onPointerUp={stopAllPropagation}
        onTouchStart={stopAllPropagation}
        onTouchEnd={stopAllPropagation}
      >
        <button
          ref={animRef}
          type="button"
          onClick={handleClick}
          className={linkClassName}
          {...rest}
        >
          {contentNode}
        </button>
        <LoginModal
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSuccess={() => {
            setLoginOpen(false);
            if (to) navigate(to);
          }}
        />
      </div>
    );
  }

  // Otherwise (unlocked OR authenticated user navigating to reader/detail)
  return (
    <Link
      ref={animRef}
      to={to}
      onClick={handleClick}
      className={linkClassName}
      {...rest}
    >
      {contentNode}
    </Link>
  );
};

export default ChapterAccessLink;
