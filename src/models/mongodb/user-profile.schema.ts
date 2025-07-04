import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user_profiles', timestamps: true, versionKey: false })
export class UserProfile extends Document {
  @Prop({ required: true, index: true })
  user_id: number;

  @Prop({ type: String })
  foto_perfil: string;

  @Prop({ type: String, maxlength: 500 })
  biografia: string;

  @Prop({
    type: {
      idioma: { type: String, enum: ['es', 'en', 'qu'], default: 'es' },
      velocidad_audio: { type: String, enum: ['lenta', 'normal', 'rapida'], default: 'normal' },
      notificaciones: { type: Boolean, default: true },
      modo_contraste: { type: String, enum: ['normal', 'alto', 'invertido'], default: 'normal' },
      volumen_default: { type: Number, min: 0, max: 100, default: 70 },
      autoplay_mensajes: { type: Boolean, default: true }
    },
    default: {}
  })
  preferencias: {
    idioma: string;
    velocidad_audio: string;
    notificaciones: boolean;
    modo_contraste: string;
    volumen_default: number;
    autoplay_mensajes: boolean;
  };

  @Prop({
    type: {
      tamaño_fuente: { type: String, enum: ['pequeño', 'normal', 'grande', 'extra_grande'], default: 'normal' },
      alto_contraste: { type: Boolean, default: false },
      lector_pantalla: { type: Boolean, default: false },
      vibracion_activada: { type: Boolean, default: true },
      audio_navegacion: { type: Boolean, default: true },
      señales_tacticas: { type: Boolean, default: false }
    },
    default: {}
  })
  configuracion_accesibilidad: {
    tamaño_fuente: string;
    alto_contraste: boolean;
    lector_pantalla: boolean;
    vibracion_activada: boolean;
    audio_navegacion: boolean;
    señales_tacticas: boolean;
  };

  @Prop({
    type: [{
      route_id: { type: Number, required: true },
      nombre_ruta: { type: String, required: true },
      fecha_uso: { type: Date, default: Date.now },
      frecuencia_uso: { type: Number, default: 1 },
      calificacion: { type: Number, min: 1, max: 5 },
      es_favorita: { type: Boolean, default: false }
    }],
    default: []
  })
  historial_rutas_favoritas: Array<{
    route_id: number;
    nombre_ruta: string;
    fecha_uso: Date;
    frecuencia_uso: number;
    calificacion?: number;
    es_favorita: boolean;
  }>;

  @Prop({
    type: {
      total_rutas_utilizadas: { type: Number, default: 0 },
      tiempo_total_navegacion: { type: Number, default: 0 },
      distancia_total_recorrida: { type: Number, default: 0 },
      ultimo_uso: { type: Date, default: Date.now },
      sesiones_totales: { type: Number, default: 0 },
      promedio_tiempo_sesion: { type: Number, default: 0 },
      rutas_completadas: { type: Number, default: 0 },
      mensajes_escuchados: { type: Number, default: 0 }
    },
    default: {}
  })
  estadisticas_uso: {
    total_rutas_utilizadas: number;
    tiempo_total_navegacion: number;
    distancia_total_recorrida: number;
    ultimo_uso: Date;
    sesiones_totales: number;
    promedio_tiempo_sesion: number;
    rutas_completadas: number;
    mensajes_escuchados: number;
  };
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
