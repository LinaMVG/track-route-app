declare module 'node-soap' {
  import { EventEmitter } from 'events';

  export interface Client extends EventEmitter {
    createClientAsync(url: string, options?: any): Promise<Client>;
    // agrega otros métodos que uses
  }

  export function createClientAsync(url: string, options?: any): Promise<Client>;

  const soap: {
    createClientAsync(url: string, options?: any): Promise<Client>;
    // otros miembros si los necesitas
  };

  export default soap;
}