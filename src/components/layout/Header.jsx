import { Map, Menu, ShieldCheck, UserCircle, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useEffect, useRef, useState } from 'react';
import { getIsAdmin } from '../../lib/supabase/api.js';
import { theme } from '../../styles/theme.js';
import { useAuth } from '../../features/auth/AuthProvider.jsx';

const HeaderFrame = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(241, 240, 237, 0.96);
  border-bottom: 1px solid ${theme.colors.line};
  backdrop-filter: blur(10px);
`;

const HeaderInner = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: ${theme.pageWidth};
  min-height: 76px;
  padding: 0 24px;
`;

const Brand = styled(NavLink)`
  align-items: center;
  display: inline-flex;
  gap: 12px;
  text-decoration: none;
`;

const Logo = styled.img`
  height: 58px;
  width: 58px;
  object-fit: contain;
`;

const BrandText = styled.span`
  font-size: 1.05rem;
  font-weight: 800;
`;

const Nav = styled.nav`
  align-items: center;
  display: flex;
  gap: 8px;

  a {
    align-items: center;
    border-radius: ${theme.radii.small};
    color: ${theme.colors.ink};
    display: inline-flex;
    font-weight: 700;
    gap: 6px;
    min-height: 44px;
    padding: 10px 12px;
    text-decoration: none;
  }

  a.active,
  a:hover {
    background: ${theme.colors.surface};
  }

  @media (max-width: 720px) {
    align-items: stretch;
    background: ${theme.colors.background};
    border-bottom: 1px solid ${theme.colors.line};
    box-shadow: ${theme.shadow};
    display: ${({ $open }) => ($open ? 'flex' : 'none')};
    flex-direction: column;
    left: 0;
    padding: 12px 24px 20px;
    position: absolute;
    right: 0;
    top: 76px;
  }
`;

const NavIcon = styled.img`
  height: 16px;
  width: 16px;
`;

const MenuButton = styled.button`
  align-items: center;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radii.small};
  color: ${theme.colors.ink};
  cursor: pointer;
  display: none;
  height: 44px;
  justify-content: center;
  width: 44px;

  &:focus-visible {
    outline: 3px solid ${theme.colors.fjord};
    outline-offset: 3px;
  }

  @media (max-width: 720px) {
    display: inline-flex;
  }
`;

export function Header() {
  const { isConfigured, user } = useAuth();
  const { hash, pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [hash, pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    navRef.current?.querySelector('a')?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!isConfigured || !user) {
      setIsAdmin(false);
      return undefined;
    }

    let isMounted = true;

    getIsAdmin()
      .then((value) => {
        if (isMounted) {
          setIsAdmin(value);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAdmin(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isConfigured, user]);

  return (
    <HeaderFrame>
      <HeaderInner>
        <Brand to="/" onClick={() => setMenuOpen(false)}>
          <Logo
            src="/images/lofoten-peaks-logo.svg"
            alt="Lofoten Peaks logo"
            width="58"
            height="58"
          />
          <BrandText>Lofoten Peaks</BrandText>
        </Brand>
        <Nav id="main-navigation" ref={navRef} $open={menuOpen} aria-label="Main navigation">
          <NavLink to="/mountains" onClick={() => setMenuOpen(false)}>
            <NavIcon
              src="/images/lofoten-peaks-mountain-icon.svg"
              alt=""
              aria-hidden="true"
              width="16"
              height="16"
            />{' '}
            Hikes
          </NavLink>
          <Link to="/#hike-map" onClick={() => setMenuOpen(false)}>
            <Map size={16} aria-hidden="true" /> Map
          </Link>
          <NavLink to="/terms#hiking-safety" onClick={() => setMenuOpen(false)}>
            <ShieldCheck size={16} aria-hidden="true" /> Safety
          </NavLink>
          <NavLink to="/account" onClick={() => setMenuOpen(false)}>
            <UserCircle size={16} aria-hidden="true" /> {user ? 'Profile' : 'Account'}
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
              <ShieldCheck size={16} aria-hidden="true" /> Admin
            </NavLink>
          )}
        </Nav>
        <MenuButton
          ref={menuButtonRef}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="main-navigation"
          aria-expanded={menuOpen}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </MenuButton>
      </HeaderInner>
    </HeaderFrame>
  );
}
