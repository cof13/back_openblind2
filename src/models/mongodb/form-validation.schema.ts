import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'form_validations', timestamps: true, versionKey: false })
export class FormValidation extends Document {
  @Prop({ required: true })
  formulario_tipo: string;

  @Prop({ required: true })
  campo_nombre: string;

  @Prop({ required: true })
  regla_validacion: string;

  @Prop({ type: Object })
  parametros_validacion: {
    min_length?: number;
    max_length?: number;
    pattern?: string;
    required?: boolean;
  };

  @Prop()
  mensaje_error: string;

  @Prop({ default: 'es' })
  idioma: string;

  @Prop({ default: true })
  activa: boolean;
}

export const FormValidationSchema = SchemaFactory.createForClass(FormValidation);
