import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'voice_guides', timestamps: true, versionKey: false })
export class VoiceGuide extends Document {
  @Prop({ required: true, index: true })
  id_ruta: number;

  @Prop({ required: true, index: true })
  id_mensaje: number;

  @Prop({ required: true })
  archivo_audio_url: string;

  @Prop({ type: Number, min: 1, max: 600 })
  duracion_segundos: number;

  @Prop({ type: String, enum: ['es', 'en', 'qu'], default: 'es', index: true })
  idioma: string;

  @Prop({ type: String, enum: ['lenta', 'normal', 'rapida'], default: 'normal' })
  velocidad_reproduccion: string;

  @Prop({ type: String, enum: ['activo', 'inactivo', 'procesando'], default: 'procesando', index: true })
  estado: string;

  @Prop({
    type: {
      formato: { type: String, enum: ['mp3', 'wav', 'aac'], default: 'mp3' },
      calidad: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
      tamaño_mb: { type: Number, min: 0 }
    }
  })
  metadatos_audio: {
    formato: string;
    calidad: string;
    tamaño_mb?: number;
  };

  @Prop({
    type: {
      total_reproducciones: { type: Number, default: 0 },
      tiempo_promedio_escucha: { type: Number, default: 0 },
      usuarios_unicos: { type: Number, default: 0 }
    },
    default: {}
  })
  estadisticas_uso: {
    total_reproducciones: number;
    tiempo_promedio_escucha: number;
    usuarios_unicos: number;
  };

  // Inicializador para _id
  _id: Types.ObjectId = new Types.ObjectId(); // Esto es solo un ejemplo
}

export const VoiceGuideSchema = SchemaFactory.createForClass(VoiceGuide);
