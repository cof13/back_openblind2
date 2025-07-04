import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'station_details', timestamps: true, versionKey: false })
export class StationDetails extends Document {
  @Prop({ required: true, index: true })
  station_id: number;

  @Prop({ type: String, maxlength: 500 })
  direccion: string;

  @Prop({ type: String })
  imagen_url: string;

  @Prop({
    type: {
      wifi_gratuito: { type: Boolean, default: false },
      baños: { type: Boolean, default: false },
      ascensor: { type: Boolean, default: false },
      escaleras_electricas: { type: Boolean, default: false },
      estacionamiento: { type: Boolean, default: false },
      comercios: [{ type: String }]
    },
    default: {}
  })
  servicios: {
    wifi_gratuito: boolean;
    baños: boolean;
    ascensor: boolean;
    escaleras_electricas: boolean;
    estacionamiento: boolean;
    comercios?: string[];
  };

  @Prop({
    type: {
      rampa_acceso: { type: Boolean, default: false },
      señalizacion_braille: { type: Boolean, default: false },
      audio_informativo: { type: Boolean, default: false },
      piso_tactil: { type: Boolean, default: false },
      asientos_preferenciales: { type: Boolean, default: false }
    },
    default: {}
  })
  accesibilidad: {
    rampa_acceso: boolean;
    señalizacion_braille: boolean;
    audio_informativo: boolean;
    piso_tactil: boolean;
    asientos_preferenciales: boolean;
  };

  @Prop({
    type: {
      lunes_viernes: { apertura: { type: String, default: '05:00' }, cierre: { type: String, default: '23:00' } },
      sabados: { apertura: { type: String, default: '06:00' }, cierre: { type: String, default: '22:00' } },
      domingos: { apertura: { type: String, default: '07:00' }, cierre: { type: String, default: '21:00' } }
    },
    default: {}
  })
  horarios_operacion: {
    lunes_viernes: { apertura: string; cierre: string };
    sabados: { apertura: string; cierre: string };
    domingos: { apertura: string; cierre: string };
  };
}

export const StationDetailsSchema = SchemaFactory.createForClass(StationDetails);
