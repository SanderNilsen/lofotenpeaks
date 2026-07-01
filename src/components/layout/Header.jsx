import { Menu, ShieldCheck, UserCircle, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useState } from 'react';
import { theme } from '../../styles/theme.js';

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
  height: 40px;
  justify-content: center;
  width: 40px;

  @media (max-width: 720px) {
    display: inline-flex;
  }
`;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <HeaderFrame>
      <HeaderInner>
        <Brand to="/" onClick={() => setMenuOpen(false)}>
          <Logo src="/images/lofoten-peaks-logo.svg" alt="Lofoten Peaks logo" />
          <BrandText>Lofoten Peaks</BrandText>
        </Brand>
        <Nav $open={menuOpen} aria-label="Main navigation">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/mountains" onClick={() => setMenuOpen(false)}>
            <NavIcon src="/images/lofoten-peaks-mountain-icon.svg" alt="" aria-hidden="true" /> Mountains
          </NavLink>
          <NavLink to="/account" onClick={() => setMenuOpen(false)}>
            <UserCircle size={16} aria-hidden="true" /> Account
          </NavLink>
          <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
            <ShieldCheck size={16} aria-hidden="true" /> Admin
          </NavLink>
        </Nav>
        <MenuButton
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </MenuButton>
      </HeaderInner>
    </HeaderFrame>
  );
}
