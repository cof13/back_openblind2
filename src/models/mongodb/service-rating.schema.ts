import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'service_ratings', timestamps: true, versionKey: false })
export class ServiceRating extends Document {
  @Prop({ required: true, index: true })
  servicio: string;

   declare _id: Types.ObjectId;

  @Prop({ required: true, index: true })
  categoria: string;

  @Prop({ required: true, min: 0, max: 10 })
  puntuacion: number;

  @Prop({ required: true, min: 1, max: 12, index: true })
  mes: number;

  @Prop({ required: true, index: true })
  anio: number;

  @Prop({ type: String, maxlength: 1000 })
  observaciones: string;

  @Prop({ type: Number, index: true })
  id_usuario_evaluador: number;

  @Prop({
    type: [{
      aspecto: { type: String, required: true },
      puntuacion_individual: { type: Number, required: true, min: 0, max: 10 },
      comentario: { type: String, maxlength: 500 }
    }],
    default: []
  })
  detalles_evaluacion: Array<{
    aspecto: string;
    puntuacion_individual: number;
    comentario?: string;
  }>;

  @Prop({ type: Date, default: Date.now, index: true })
  fecha_evaluacion: Date;
}

export const ServiceRatingSchema = SchemaFactory.createForClass(ServiceRating);
