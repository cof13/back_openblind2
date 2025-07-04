import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'location_history', timestamps: true, versionKey: false })
export class LocationHistory extends Document {
  @Prop({ required: true, index: true })
  id_usuario: number;

  @Prop({ type: Number, index: true })
  id_ruta: number;

  @Prop({ required: true, index: '2dsphere' })
  coordenadas: string;

  @Prop({ type: Date, default: Date.now, index: true })
  timestamp_ubicacion: Date;

  @Prop({ type: Number, min: 0 })
  precision_metros: number;

  @Prop({ type: Number, min: 0 })
  velocidad_kmh: number;

  @Prop({
    type: {
      en_ruta: { type: Boolean, default: false },
      direccion_movimiento: { type: String },
      destino_objetivo: { type: String },
      tiempo_estimado_llegada: { type: Number }
    }
  })
  contexto_navegacion: {
    en_ruta: boolean;
    direccion_movimiento?: string;
    destino_objetivo?: string;
    tiempo_estimado_llegada?: number;
  };

  @Prop({
    type: {
      brujula: { type: Number, min: 0, max: 360 },
      nivel_bateria: { type: Number, min: 0, max: 100 }
    }
  })
  datos_sensor: {
    brujula?: number;
    nivel_bateria?: number;
  };
}

export const LocationHistorySchema = SchemaFactory.createForClass(LocationHistory);
