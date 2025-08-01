/**
 * Lemora Wallet Tracker - UI Type Definitions
 * Types for user interface components and interactions
 */

export interface UITheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  error: string;
  success: string;
  warning: string;
}

export interface UIComponent {
  id: string;
  type: ComponentType;
  props: ComponentProps;
  children?: UIComponent[];
}

export enum ComponentType {
  BUTTON = 'BUTTON',
  INPUT = 'INPUT',
  CARD = 'CARD',
  LIST = 'LIST',
  MODAL = 'MODAL',
  CHART = 'CHART',
  TABLE = 'TABLE'
}

export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onChange?: (value: any) => void;
  data?: any;
}

export interface SidePanelConfig {
  width: number;
  position: 'left' | 'right';
  theme: UITheme;
  sections: PanelSection[];
}

export interface PanelSection {
  id: string;
  title: string;
  icon?: string;
  component: UIComponent;
  visible: boolean;
  order: number;
}

export interface NotificationConfig {
  position: 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  duration: number;
  maxCount: number;
  animation: AnimationType;
}

export enum AnimationType {
  SLIDE = 'SLIDE',
  FADE = 'FADE',
  ZOOM = 'ZOOM',
  BOUNCE = 'BOUNCE'
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'candlestick';
  data: ChartData;
  options: ChartOptions;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  color?: string;
  backgroundColor?: string;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  animation?: AnimationConfig;
  scales?: ScalesConfig;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
}

export interface ScalesConfig {
  x?: AxisConfig;
  y?: AxisConfig;
}

export interface AxisConfig {
  display: boolean;
  grid?: GridConfig;
  ticks?: TicksConfig;
}

export interface GridConfig {
  display: boolean;
  color: string;
}

export interface TicksConfig {
  color: string;
  font?: FontConfig;
}

export interface FontConfig {
  size: number;
  family: string;
  weight?: string;
}
