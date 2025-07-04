import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'search_history', timestamps: true, versionKey: false })
export class SearchHistory extends Document {
  @Prop({ required: true })
  usuario_id: number;

  @Prop({ required: true })
  termino_busqueda: string;

  @Prop({ required: true })
  entidad_tipo: string;

  @Prop({ type: [String] }) 
  filtros_aplicados: string[];

  @Prop({ default: 0 })
  resultados_encontrados: number;

  @Prop({ default: Date.now })
  fecha_busqueda: Date;

  @Prop()
  ip_address: string;
}

export const SearchHistorySchema = SchemaFactory.createForClass(SearchHistory);
