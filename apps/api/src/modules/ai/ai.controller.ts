import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AIService } from './services/ai.service';
import { FirebaseGuard } from '../../common/guards/firebase.guard';
import { Interests, InterestsResponse } from 'src/interfaces';
import path from 'path';
import * as fs from 'fs';

@Controller('ai')
export class AIController {
  private readonly storageBaseDir = path.join(process.cwd(), 'storage', 'users');

  constructor(private readonly aiService: AIService) { }

  @UseGuards(FirebaseGuard)
  @Post('chat')
  async chat(
    @Req() req: any,
    @Body('prompt') prompt: string,
    @Body('conversationId') conversationId: string = 'main',
  ): Promise<{ response: string; options: string[] }> {
    const userId = req.user.id;
    const response = await this.aiService.generateResponse(
      userId,
      conversationId,
      prompt,
      'nuxt',
    );
    return response;
  }

  @UseGuards(FirebaseGuard)
  @Get('interests')
  async interests(
    @Req() req: any,
  ): Promise<InterestsResponse> {
    const userId = req.user.id;
    const interests = await this.getListInterests(userId, new Date().toISOString().split('T')[0]);
    if (interests && interests.interests.length > 0) {
      return interests;
    }
    const prompt = `Genereme un listado de información en relación sobre lo que le interesa al usuario, en formato JSON, te comparto un ejemplo de lo que espero recibir: [
      {
          "type": "trend",
          "tag": "Tech Trend",
          "title": "Astro 5.0 lanzado",
          "description": "Mejoras en Content Layer y rendimiento optimizado para sitios estáticos más rápidos.",
          "icon": "trending_up",
          "colorClass": "color-blue",
          "link": "https://astro.build/blog/astro-4/",
          "footer": "Hace 2 horas"
      },
      {
          "type": "history",
          "tag": "Un día como hoy",
          "title": "Nace Thomas Edison",
          "description": "En 1847 nacía el prolífico inventor que patentó la bombilla incandescente y el fonógrafo.",
          "icon": "history",
          "colorClass": "color-amber",
          "footer": "1847"
      },
      {
          "type": "tip",
          "tag": "Tip del Día",
          "title": "Regla de los 2 minutos",
          "description": "Si una tarea tarda menos de 2 minutos en hacerse, hazla ya. No la pospongas.",
          "icon": "lightbulb",
          "colorClass": "color-purple"
      },
      {
          "type": "quote",
          "tag": "Inspiración",
          "title": "\\"Hazlo o no lo hagas\\"",
          "description": "No existe el \\"intentar\\". — Maestro Yoda",
          "icon": "format_quote",
          "colorClass": "color-emerald"
      }
    ]
      **IMPORTANT**: solo responde con el formato JSON, no agregues nada más.
      **IMPORTANT**: Genere 8 items en total.
      **IMPORTANT**: Realice una busqueda in internet, la fecha actual es de ${new Date().toISOString()}.`;
    const response = await this.aiService.generateResponse(
      userId,
      'interests',
      prompt,
      'nuxt',
    );
    const data: Interests[] = JSON.parse(response.response);
    await this.syncUserInterests(userId, data);
    return { interests: data };
  }

  private async getListInterests(userId: string, createdAt: string): Promise<InterestsResponse | null> {
    try {
      const filePath = path.join(this.storageBaseDir, userId, 'interests.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      const interests: Interests[] = JSON.parse(data);
      const interestsList = interests.filter((interest) => interest.createdAt === createdAt);

      return { interests: interestsList };
    } catch (error) {
      console.error(`Failed to get list interests:`, error);
      return null;
    }
  }

  private async syncUserInterests(userId: string, interests: Interests[]) {
    try {
      const userDir = path.join(this.storageBaseDir, userId);

      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      const filePath = path.join(userDir, 'interests.json');
      interests.forEach((interest) => {
        interest.createdAt = new Date().toISOString().split('T')[0];
      });
      fs.writeFileSync(filePath, JSON.stringify(interests, null, 2));
    } catch (error) {
      console.error(`Failed to sync interests for user ${userId}:`, error);
    }
  }
}
