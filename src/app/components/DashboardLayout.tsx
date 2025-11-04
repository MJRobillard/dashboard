import React from 'react';

/**
 * DashboardLayout
 * @param layout - Array of layout items: { key: string, colSpan: number, minColSpan?: number }
 * @param registry - Object mapping card keys to React components
 * @param cardProps - Object mapping card keys to props for each card
 */
interface LayoutItem {
  key: string;
  colSpan: 1 | 2 | 3;
  minColSpan?: number;
}

interface DashboardLayoutProps {
  layout: LayoutItem[];
  registry: Record<string, React.ComponentType<any>>;
  cardProps: Record<string, any>;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ layout, registry, cardProps }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {layout.map(item => {
        const Card = registry[item.key];
        if (!Card) return null;
        const spanClass = item.colSpan === 3
          ? 'md:col-span-3'
          : item.colSpan === 2
            ? 'md:col-span-2'
            : 'md:col-span-1';
        return (
          <div key={item.key} className={spanClass}>
            <Card {...(cardProps[item.key] || {})} />
          </div>
        );
      })}
    </div>
  );
};

export default DashboardLayout; 