import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'route_details', timestamps: true, versionKey: false })
export class RouteDetails extends Document {
  @Prop({ required: true, index: true })
  route_id: number;

  @Prop({ required: true, maxlength: 500 })
  ubicacion_ruta: string;

  @Prop({ required: true, maxlength: 200 })
  nombre_transporte: string;

  @Prop({ type: String, maxlength: 1000 })
  descripcion: string;

  @Prop({
    type: [{
      nombre: { type: String, required: true },
      coordenadas: { type: String, required: true },
      descripcion: { type: String },
      orden: { type: Number, required: true },
      tiempo_estimado_llegada: { type: Number },
      es_parada_obligatoria: { type: Boolean, default: false }
    }],
    default: []
  })
  puntos_intermedios: Array<{
    nombre: string;
    coordenadas: string;
    descripcion?: string;
    orden: number;
    tiempo_estimado_llegada?: number;
    es_parada_obligatoria: boolean;
  }>;

  @Prop({
    type: [{
      dia_semana: { type: String, enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'], required: true },
      hora_inicio: { type: String, required: true },
      hora_fin: { type: String, required: true },
      frecuencia_min: { type: Number, required: true }
    }],
    default: []
  })
  horarios_servicio: Array<{
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    frecuencia_min: number;
  }>;

  @Prop({
    type: {
      rampa_acceso: { type: Boolean, default: false },
      audio_informativo: { type: Boolean, default: false },
      señalizacion_braille: { type: Boolean, default: false },
      ascensor: { type: Boolean, default: false },
      piso_tactil: { type: Boolean, default: false },
      asientos_preferenciales: { type: Boolean, default: false }
    },
    default: {}
  })
  informacion_accesibilidad: {
    rampa_acceso: boolean;
    audio_informativo: boolean;
    señalizacion_braille: boolean;
    ascensor: boolean;
    piso_tactil: boolean;
    asientos_preferenciales: boolean;
  };

  @Prop({ type: [String], default: [] })
  imagenes: string[];

  @Prop({
    type: {
      total_usuarios: { type: Number, default: 0 },
      calificacion_promedio: { type: Number, default: 0, min: 0, max: 5 },
      comentarios_recientes: { type: Number, default: 0 },
      popularidad_score: { type: Number, default: 0 }
    },
    default: {}
  })
  metadatos: {
    total_usuarios: number;
    calificacion_promedio: number;
    comentarios_recientes: number;
    popularidad_score: number;
  };
}

export const RouteDetailsSchema = SchemaFactory.createForClass(RouteDetails);
