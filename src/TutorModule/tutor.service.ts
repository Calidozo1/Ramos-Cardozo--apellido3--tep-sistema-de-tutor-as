import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutor } from './tutor.entity';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { Usuario } from '../UsuarioModule/usuario.entity';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioConRolDto } from '../UsuarioModule/dto/create-usuario-con-rol.dto';
import { AsignarMateriaDto } from './dto/asignar-materia.dto';
import { Materia } from '../MateriaModule/materia.entity';

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private readonly tutorRepository: Repository<Tutor>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Materia)
    private readonly materiaRepo: Repository<Materia>,
  ) {
  }

  async create(dto: CreateUsuarioConRolDto) {
    const { nombre, correo, contrasena, rol, ...tutorData } = dto;

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const nuevoUsuario = this.usuarioRepository.create({
      nombre,
      correo,
      contrasena: hashedPassword,
    });
    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
    const nuevoTutor = this.tutorRepository.create({
      ...tutorData,
      id: usuarioGuardado.id,
      usuario: usuarioGuardado,
    });

    const tutorGuardado = await this.tutorRepository.save(nuevoTutor);
    return tutorGuardado;
  }

  findAll(): Promise<Tutor[]> {
    return this.tutorRepository.find({
      relations: {
        materia: true,
      },
    });
  }

  async findOne(id: number): Promise<Tutor> {
    const tutor = await this.tutorRepository.findOne({
      where: { id },
      relations: { materia: true },
    });

    if (!tutor) {
      throw new NotFoundException(`Tutor con ID #${id} no encontrado`);
    }
    return tutor;
  }

  async update(id: number, updateTutorDto: UpdateTutorDto) {
    const { nombre, correo, contrasena, materiaId, ...tutorData } =
      updateTutorDto;

    const payload: any = { ...tutorData };

    if (materiaId) payload.materia = { id: materiaId };

    if (nombre || correo || contrasena) {
      payload.usuario = {};
      if (nombre) payload.usuario.nombre = nombre;
      if (correo) payload.usuario.correo = correo;
      if (contrasena) {
        payload.usuario.contrasena = await bcrypt.hash(contrasena, 10);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const tutor = await this.tutorRepository.preload({ id, ...payload });

    if (!tutor) {
      throw new NotFoundException(`Tutor con ID #${id} no encontrado`);
    }
    const tutorGuardado = await this.tutorRepository.save(tutor);

    // Si el usuario fue actualizado, también se devuelve sin la contraseña
    if (tutorGuardado.usuario) {
    }
    return tutorGuardado;
  }

  async remove(id: number) {
    const tutor = await this.findOne(id);
    return this.tutorRepository.remove(tutor);
  }

  async asignarMateria(dto: AsignarMateriaDto) {
    const tutor = await this.tutorRepository.findOne({
      where: { cedula: dto.cedulaTutor },
      relations: ['usuario'],
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    const materia = await this.materiaRepo.findOneBy({ id: dto.materiaId });

    if (!materia) {
      throw new NotFoundException('Materia no encontrada');
    }

    tutor.materia = materia;
    await this.tutorRepository.save(tutor);

    return {
      mensaje: 'Materia asignada correctamente al tutor',
      tutor: {
        nombre: tutor.usuario.nombre,
        cedula: tutor.cedula,
      },
      materia: {
        id: materia.id,
        nombre: materia.nombre,
      },
    };
  }



}