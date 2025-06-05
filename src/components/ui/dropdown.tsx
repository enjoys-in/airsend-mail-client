import React, { useEffect, useState, useRef } from 'react';

interface DropdownItem {
  id: string;
  content: React.ReactNode;
}

interface DropdownProps {
  items: DropdownItem[];
  onSelect: (id: string) => void;
  onClickOutside: () => void;
  anchorEl: HTMLElement | null;
  position?: 'bottom' | 'top' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  width?: number | string;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  onSelect,
  onClickOutside,
  anchorEl,
  position = 'bottom',
  align = 'start',
  width = 'auto',
}) => {
  const [style, setStyle] = useState({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorEl, onClickOutside]);

  useEffect(() => {
    if (anchorEl && dropdownRef.current) {
      const rect = anchorEl.getBoundingClientRect();
      const dropdown = dropdownRef.current;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      let top = 0, left = 0;

      switch (position) {
        case 'bottom':
          top = rect.bottom + scrollTop;
          break;
        case 'top':
          top = rect.top + scrollTop - dropdown.offsetHeight;
          break;
        case 'left':
          left = rect.left + scrollLeft - dropdown.offsetWidth;
          top = rect.top + scrollTop;
          break;
        case 'right':
          left = rect.right + scrollLeft;
          top = rect.top + scrollTop;
          break;
      }

      if (position === 'bottom' || position === 'top') {
        switch (align) {
          case 'start':
            left = rect.left + scrollLeft;
            break;
          case 'center':
            left = rect.left + scrollLeft + rect.width / 2 - dropdown.offsetWidth / 2;
            break;
          case 'end':
            left = rect.right + scrollLeft - dropdown.offsetWidth;
            break;
        }
      } else {
        switch (align) {
          case 'start':
            top = rect.top + scrollTop;
            break;
          case 'center':
            top = rect.top + scrollTop + rect.height / 2 - dropdown.offsetHeight / 2;
            break;
          case 'end':
            top = rect.bottom + scrollTop - dropdown.offsetHeight;
            break;
        }
      }

      setStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        width: typeof width === 'number' ? `${width}px` : width,
        zIndex: 1000,
      });
    }
  }, [anchorEl, position, align, width]);

  return (
    <div
      ref={dropdownRef}
      className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-md shadow-lg py-1 animate-fadeIn"
      style={style}
    >
      {items.map(item => (
        <div
          key={item.id}
          className="px-4 py-2 text-gray-800 dark:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
          onClick={() => onSelect(item.id)}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

export default Dropdown;
