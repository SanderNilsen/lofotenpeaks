import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ImageCredits } from '../common/ImageCredits.jsx';
import { theme } from '../../styles/theme.js';

const Gallery = styled.div`
  display: grid;
  gap: 12px;
  grid-auto-rows: ${({ $count }) => ($count > 2 ? '190px' : 'auto')};
  grid-template-columns: ${({ $count }) => {
    if ($count === 1) {
      return 'minmax(0, 1fr)';
    }

    if ($count === 2) {
      return 'repeat(2, minmax(0, 1fr))';
    }

    return 'repeat(3, minmax(0, 1fr))';
  }};

  > button:first-child {
    aspect-ratio: ${({ $count }) => ($count > 2 ? 'auto' : '16 / 9')};
    grid-column: ${({ $count }) => ($count > 2 ? 'span 2' : 'auto')};
    grid-row: ${({ $count }) => ($count > 2 ? 'span 2' : 'auto')};
  }

  @media (max-width: 760px) {
    grid-auto-rows: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > button:first-child {
      aspect-ratio: 16 / 10;
      grid-column: span 2;
      grid-row: auto;
    }
  }
`;

const GalleryButton = styled.button`
  background: ${theme.colors.ink};
  border: 0;
  border-radius: ${theme.radii.medium};
  cursor: zoom-in;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  position: relative;

  img {
    height: 100%;
    object-fit: cover;
    transition: transform 180ms ease;
    width: 100%;
  }

  span {
    align-items: center;
    background: rgba(18, 24, 23, 0.72);
    border-radius: 999px;
    bottom: 12px;
    color: ${theme.colors.surface};
    display: inline-flex;
    height: 38px;
    justify-content: center;
    opacity: 0;
    position: absolute;
    right: 12px;
    transition: opacity 180ms ease;
    width: 38px;
  }

  &:hover img {
    transform: scale(1.02);
  }

  &:hover span,
  &:focus-visible span {
    opacity: 1;
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  @media (max-width: 760px) {
    aspect-ratio: 4 / 3;
  }

  @media (prefers-reduced-motion: reduce) {
    img,
    span {
      transition: none;
    }
  }
`;

const CreditBlock = styled.div`
  border-top: 1px solid ${theme.colors.line};
  margin-top: 24px;
  padding-top: 22px;

  h3 {
    font-size: 1rem;
    margin: 0 0 14px;
  }
`;

const LightboxBackdrop = styled.div`
  align-items: center;
  background: #101312;
  display: grid;
  inset: 0;
  justify-items: center;
  padding: 68px 74px 28px;
  position: fixed;
  z-index: 2000;

  @media (max-width: 640px) {
    padding: 68px 16px 24px;
  }
`;

const LightboxImage = styled.img`
  max-height: calc(100vh - 130px);
  max-width: min(1180px, 100%);
  object-fit: contain;
`;

const LightboxClose = styled.button`
  align-items: center;
  background: ${theme.colors.surface};
  border: 0;
  border-radius: 999px;
  color: ${theme.colors.ink};
  cursor: pointer;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  position: absolute;
  right: 20px;
  top: 16px;
  width: 44px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.surface};
    outline-offset: 4px;
  }
`;

const LightboxArrow = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 999px;
  color: ${theme.colors.surface};
  cursor: pointer;
  display: inline-flex;
  height: 48px;
  justify-content: center;
  left: ${({ $next }) => ($next ? 'auto' : '18px')};
  position: absolute;
  right: ${({ $next }) => ($next ? '18px' : 'auto')};
  top: 50%;
  transform: translateY(-50%);
  width: 48px;

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.surface};
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    bottom: 12px;
    left: ${({ $next }) => ($next ? 'auto' : 'calc(50% - 58px)')};
    right: ${({ $next }) => ($next ? 'calc(50% - 58px)' : 'auto')};
    top: auto;
    transform: none;
  }
`;

const LightboxCount = styled.p`
  bottom: 22px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.84rem;
  font-weight: 800;
  left: 50%;
  margin: 0;
  position: absolute;
  transform: translateX(-50%);

  @media (max-width: 640px) {
    bottom: 68px;
  }
`;

export function TrailPhotoGallery({ images, credits, imageFiles }) {
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const lightboxRef = useRef(null);
  const closeButtonRef = useRef(null);
  const galleryOpenerRef = useRef(null);
  const activeImage = activeImageIndex === null ? null : images[activeImageIndex];

  useEffect(() => {
    if (activeImageIndex === null) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setActiveImageIndex(null);
        galleryOpenerRef.current?.focus();
      }

      if (event.key === 'ArrowLeft' && images.length > 1) {
        setActiveImageIndex((index) => (index - 1 + images.length) % images.length);
      }

      if (event.key === 'ArrowRight' && images.length > 1) {
        setActiveImageIndex((index) => (index + 1) % images.length);
      }

      if (event.key === 'Tab') {
        const controls = [...(lightboxRef.current?.querySelectorAll('button') ?? [])];
        const firstControl = controls[0];
        const lastControl = controls.at(-1);

        if (event.shiftKey && document.activeElement === firstControl) {
          event.preventDefault();
          lastControl?.focus();
        } else if (!event.shiftKey && document.activeElement === lastControl) {
          event.preventDefault();
          firstControl?.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImageIndex, images.length]);

  function openGallery(index, event) {
    galleryOpenerRef.current = event.currentTarget;
    setActiveImageIndex(index);
  }

  function closeGallery() {
    setActiveImageIndex(null);
    galleryOpenerRef.current?.focus();
  }

  return (
    <>
      <Gallery $count={images.length}>
        {images.map((image, index) => (
          <GalleryButton
            key={image.src}
            type="button"
            aria-label={`Open photo ${index + 1} of ${images.length}: ${image.alt}`}
            onClick={(event) => openGallery(index, event)}
          >
            <img
              src={image.src}
              alt={image.alt}
              width="900"
              height="675"
              loading="lazy"
              decoding="async"
            />
            <span aria-hidden="true">
              <ZoomIn size={19} />
            </span>
          </GalleryButton>
        ))}
      </Gallery>

      <CreditBlock>
        <h3>Photo credits</h3>
        <ImageCredits credits={credits} imageFiles={imageFiles} />
      </CreditBlock>

      {activeImage && (
        <LightboxBackdrop
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${activeImageIndex + 1} of ${images.length}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeGallery();
            }
          }}
        >
          <LightboxClose ref={closeButtonRef} type="button" aria-label="Close photo" onClick={closeGallery}>
            <X size={22} aria-hidden="true" />
          </LightboxClose>
          {images.length > 1 && (
            <>
              <LightboxArrow
                type="button"
                aria-label="Previous photo"
                onClick={() => setActiveImageIndex((index) => (index - 1 + images.length) % images.length)}
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </LightboxArrow>
              <LightboxArrow
                $next
                type="button"
                aria-label="Next photo"
                onClick={() => setActiveImageIndex((index) => (index + 1) % images.length)}
              >
                <ChevronRight size={24} aria-hidden="true" />
              </LightboxArrow>
            </>
          )}
          <LightboxImage src={activeImage.src} alt={activeImage.alt} />
          <LightboxCount aria-live="polite">
            {activeImageIndex + 1} / {images.length}
          </LightboxCount>
        </LightboxBackdrop>
      )}
    </>
  );
}
