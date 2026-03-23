export interface TraceFrame {
  ts: number;
  axis1_position: number;
  axis1_velocity: number;
  axis1_torque: number;
  axis2_position: number;
  axis2_velocity: number;
  motor_rpm: number;
  motor_temp: number;
  servo_current: number;
  servo_voltage: number;
  pressure_bar: number;
}

export interface WsDataMessage {
  type: 'data';
  taskId: string;
  seq: number;
  period: number;
  timestamp: number;
  latest: TraceFrame;
  frameCount: number;
}

export interface StatsSnapshot {
  batchCount: number;
  frameCount: number;
  elapsed: number;
  batchSpeed: string;
  frameSpeed: string;
}

export interface WsStatsMessage {
  type: 'stats';
  stats: StatsSnapshot;
}

export type WsMessage = WsDataMessage | WsStatsMessage;

export interface DataPoint extends TraceFrame {
  _time: number; // arrival timestamp for x-axis
}
