import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'tourist_points', timestamps: true, versionKey: false })
export class TouristPoint extends Document {
  @Prop({ required: true, maxlength: 200, index: 'text' })
  lugar_destino: string;

  @Prop({ required: true, maxlength: 200, index: 'text' })
  nombre: string;

  @Prop({ required: true, maxlength: 2000 })
  descripcion: string;

  @Prop({ required: true, index: '2dsphere' })
  coordenadas: string;

  @Prop({ type: String, maxlength: 500 })
  direccion: string;

  @Prop({ type: String, enum: ['historico', 'cultural', 'recreativo', 'comercial', 'transporte'], default: 'cultural', index: true })
  categoria: string;

  @Prop({ type: Number, min: 0, max: 10, default: 0 })
  calificacion_promedio: number;

  @Prop({ type: [String], default: [] })
  imagenes: string[];

   declare _id: Types.ObjectId;

  @Prop({
    type: {
      historia: { type: String, maxlength: 2000 },
      horarios_atencion: { type: String },
      precio_entrada: { type: String },
      servicios_disponibles: [{ type: String }],
      accesibilidad: {
        rampa_acceso: { type: Boolean, default: false },
        baño_adaptado: { type: Boolean, default: false },
        estacionamiento: { type: Boolean, default: false },
        transporte_publico: { type: Boolean, default: false }
      }
    }
  })
  informacion_detallada: {
    historia?: string;
    horarios_atencion?: string;
    precio_entrada?: string;
    servicios_disponibles?: string[];
    accesibilidad?: {
      rampa_acceso: boolean;
      baño_adaptado: boolean;
      estacionamiento: boolean;
      transporte_publico: boolean;
    };
  };

  @Prop({
    type: [{
      usuario_id: { type: Number, required: true },
      calificacion: { type: Number, required: true, min: 1, max: 10 },
      comentario: { type: String, maxlength: 1000 },
      fecha: { type: Date, default: Date.now }
    }],
    default: []
  })
  reviews: Array<{
    usuario_id: number;
    calificacion: number;
    comentario?: string;
    fecha: Date;
  }>;

  @Prop()
  id_usuario_creador: number;

  @Prop({ enum: ['activo', 'inactivo', 'pendiente_aprobacion'], default: 'pendiente_aprobacion', index: true })
  estado: string;
}

export const TouristPointSchema = SchemaFactory.createForClass(TouristPoint);
