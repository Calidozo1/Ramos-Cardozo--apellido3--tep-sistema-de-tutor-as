import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { EstudianteService } from './estudiantes.service';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Controller('estudiantes')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Get()
  findAll() {
    return this.estudianteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estudianteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEstudianteDto: UpdateEstudianteDto) {
    return this.estudianteService.update(id, updateEstudianteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.estudianteService.remove(id);
  }
}
