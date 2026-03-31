import { Toaster as Sonner, ToasterProps } from 'sonner';
import { useTheme } from '../../context/ThemeContext';

const Toaster = ({ ...props }: ToasterProps) => {
  const { effectiveTheme } = useTheme();

  return (
    <Sonner
      theme={effectiveTheme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'hsl(var(--popover) / 1)',
          '--normal-text': 'hsl(var(--popover-foreground) / 1)',
          '--normal-border': 'hsl(var(--border) / 1)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
