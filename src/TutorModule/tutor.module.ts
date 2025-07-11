import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorService } from './tutor.service';
import { TutorController } from './tutor.controller';
import { Tutor } from './tutor.entity';
import { UsuarioModule } from '../UsuarioModule/usuario.module';
import { Usuario } from '../UsuarioModule/usuario.entity';
import { SolicitudModule } from '../SolicitudModule/solicitud.module';
import { Sesion } from '../SesionModule/sesion.entity';
import { MateriasModule } from '../MateriaModule/materias.module';
import { Materia } from '../MateriaModule/materia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tutor, Usuario, Sesion, Materia]),
    forwardRef(() => UsuarioModule),
    forwardRef(() => SolicitudModule),
    MateriasModule,
  ],
  controllers: [TutorController],
  providers: [TutorService],
  exports: [TutorService],
})
export class TutorModule {}
