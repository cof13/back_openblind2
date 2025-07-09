import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'message_contents', timestamps: true, versionKey: false })
export class MessageContent extends Document {
  @Prop({ required: true, index: true })
  message_id: number;

  @Prop({ required: true, maxlength: 1000 })
  mensaje: string;

   declare _id: Types.ObjectId;

  @Prop({
    type: [{
      idioma: { type: String, enum: ['es', 'en', 'qu'], required: true },
      texto: { type: String, required: true, maxlength: 1000 },
      estado: { type: String, enum: ['pendiente', 'traducido', 'revisado'], default: 'pendiente' }
    }],
    default: []
  })
  traducciones: Array<{
    idioma: string;
    texto: string;
    estado: string;
  }>;

  @Prop({
    type: {
      es: { type: String },
      en: { type: String },
      qu: { type: String }
    }
  })
  audio_files: {
    es?: string;
    en?: string;
    qu?: string;
  };

  @Prop({
    type: {
      velocidad_normal: { type: String },
      velocidad_lenta: { type: String },
      velocidad_rapida: { type: String },
      duracion_segundos: { type: Number, min: 1, max: 300 },
      formato_audio: { type: String, enum: ['mp3', 'wav', 'aac'], default: 'mp3' }
    }
  })
  configuracion_audio: {
    velocidad_normal?: string;
    velocidad_lenta?: string;
    velocidad_rapida?: string;
    duracion_segundos?: number;
    formato_audio: string;
  };

  @Prop({
    type: {
      descripcion_entorno: { type: String, maxlength: 500 },
      puntos_referencia: [{ type: String }],
      direcciones_disponibles: [{ type: String }]
    }
  })
  contexto_ubicacion: {
    descripcion_entorno?: string;
    puntos_referencia?: string[];
    direcciones_disponibles?: string[];
  };
}

export const MessageContentSchema = SchemaFactory.createForClass(MessageContent);
