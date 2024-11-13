import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { OpenAI } from 'openai';
import { Apollo } from 'apollo-angular';
import {
  AUTHENTICATE_USER,
  REGISTER_APPOINTMENT,
} from '../../../graphql/mutations.graphql';
import {
  GET_ALL_DOCTORS_WITH_SCHEDULES,
  GET_ALL_APPOINTMENTS,
} from '../../../graphql/queries.graphql';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent {
  title = 'angular-openAI';
  textInput: string = '';
  output: string = '';
  isTyping: boolean = false;
  messages: any[] = [];
  conversationHistory: {
    userInput: string;
    assistantOutput: string;
  }[] = [];
  jwt: string | null = null;
  doctorsData: any[] = [];
  appointmentCreated: boolean = false;
  appointmentsData: any[] = [];
  patientId: number | null = parseInt(
    localStorage.getItem('patientId') || '0',
    10
  );

  constructor(private apollo: Apollo) {}

  async authenticateAdmin() {
    try {
      const result = await this.apollo
        .mutate({
          mutation: AUTHENTICATE_USER,
          variables: {
            input: {
              identifier: 'admin@gmail.com',
              password: '1234',
            },
          },
        })
        .toPromise();

      const data = result?.data as {
        authenticate: {
          jwt: string;
        };
      };

      if (data?.authenticate?.jwt) {
        this.jwt = data.authenticate.jwt;
      } else {
        console.error('No se pudo autenticar al administrador.');
      }
    } catch (error) {
      console.error('Error en la autenticación del administrador:', error);
    }
  }

  formatOutput(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  async fetchDoctorsAndAppointments() {
    if (!this.jwt) {
      console.error('JWT no disponible. No se puede obtener la información.');
      return;
    }

    try {
      const doctorsResult = await this.apollo
        .query({
          query: GET_ALL_DOCTORS_WITH_SCHEDULES,
          context: {
            headers: {
              Authorization: `Bearer ${this.jwt}`,
            },
          },
        })
        .toPromise();

      const doctorsData = doctorsResult?.data as {
        getAllDoctorsWithSchedules: any[];
      };
      this.doctorsData = doctorsData?.getAllDoctorsWithSchedules || [];

      const appointmentsResult = await this.apollo
        .query({
          query: GET_ALL_APPOINTMENTS,
          context: {
            headers: {
              Authorization: `Bearer ${this.jwt}`,
            },
          },
        })
        .toPromise();

      const appointmentsData = appointmentsResult?.data as {
        getAllAppointments: any[];
      };
      this.appointmentsData = appointmentsData?.getAllAppointments || [];
    } catch (error) {
      console.error('Error al obtener los datos de doctores y citas:', error);
    }
  }

  async search() {
    if (!this.textInput.trim()) {
      alert('Por favor, ingrese una pregunta.');
      return;
    }

    this.isTyping = true;
    this.output = '';

    if (!this.jwt) {
      await this.authenticateAdmin();
    }

    if (this.jwt) {
      await this.fetchDoctorsAndAppointments();
    }

    const openai = new OpenAI({
      apiKey: `${environment.OPEN_AI_API_KEY}`,
      dangerouslyAllowBrowser: true,
    });

    this.messages.push({
      role: 'user',
      content: this.textInput,
    });

    const contextPrompt = `
Eres un asistente especializado en ayudar a pacientes a programar citas médicas. Tienes acceso a la siguiente información de los doctores y sus horarios:
${JSON.stringify(this.doctorsData)}

También tienes acceso a la información de las citas médicas que ya han sido programadas y se encuentran en la lista "appointmentsData":
${JSON.stringify(this.appointmentsData)}

Esta lista de citas existentes en "appointmentsData" es la única información válida sobre los horarios ocupados. No puedes programar nuevas citas que se solapen con los horarios ya reservados en esta lista. Debes verificar estrictamente contra esta lista de citas existentes para determinar los horarios disponibles.

Tu función principal es:
1. Entender el problema de salud del paciente y recomendar doctores que sean adecuados para tratar ese problema.
2. Verificar los horarios ocupados en la lista "appointmentsData" y recomendar únicamente los horarios disponibles que no estén reservados en esa lista.
3. Siempre muestra la franja horaria completa en la que el doctor atiende antes de mostrar los horarios disponibles, para que el paciente tenga un contexto claro.
4. Cuando muestres los horarios disponibles, verifica estrictamente que no estén ocupados por otras citas de la lista "appointmentsData". Si el paciente consulta por un horario que no habías mostrado, vuelve a verificar si está disponible antes de confirmarlo.
5. Cuando el paciente acepte una cita, debes verificar nuevamente la lista de citas existentes en "appointmentsData" para asegurarte de que el horario aún está disponible. Si hay un conflicto o el horario ya está ocupado, informa al paciente y sugiere otro horario que esté disponible.
6. Cuando el paciente acepte la cita y no haya conflictos, solo entonces debes decir "La cita ha sido programada con éxito".
7. Proporciona los detalles de la cita en el siguiente formato específico:
   - DoctorId: [ID numérico del doctor seleccionado]
   - Nombre del Doctor: [Nombre del Doctor]
   - Fecha: [Fecha de la cita en formato AAAA-MM-DD]
   - Hora: [Hora en formato HH:MM]
   - Razón: [Razón proporcionada por el paciente]
   **No debes agregar caracteres especiales como asteriscos (**), símbolos, ni ningún otro carácter adicional al proporcionar los detalles. Solo sigue el formato indicado. Tampoco intentes agregarle negritas a la respuesta por favor, evita eso, solo texto plano en el formato indicado**
8. Antes de confirmar la cita:
   - Verifica que el doctorId está presente y corresponde a un doctor disponible.
   - Verifica que la fecha y la hora están disponibles para el doctor, considerando estrictamente las citas existentes en la lista "appointmentsData".
   - Pregunta al usuario si los detalles proporcionados son correctos antes de crear la cita.
   - Si durante la última verificación encuentras que el horario ya está ocupado, informa al paciente y ofrece un horario alternativo que esté disponible.

Al proporcionar los horarios disponibles para el paciente, asegúrate de excluir cualquier horario ocupado según la lista de citas existentes en "appointmentsData", y proporciona solo los horarios disponibles en intervalos de 20 minutos.
`;

    if (this.messages.length === 1) {
      this.messages.unshift({
        role: 'system',
        content: contextPrompt,
      });
    }

    try {
      const response = await openai.chat.completions.create({
        messages: this.messages,
        model: 'gpt-4o',
      });

      this.output = response.choices[0].message.content ?? '';
      this.messages.push({
        role: 'assistant',
        content: this.output,
      });

      this.conversationHistory.push({
        userInput: this.textInput,
        assistantOutput: this.output,
      });

      this.textInput = '';

      if (
        this.output
          .toLowerCase()
          .includes('la cita ha sido programada con éxito') ||
        this.output.toLowerCase().includes('cita confirmada') ||
        this.output.toLowerCase().includes('cita agendada') ||
        this.output
          .toLowerCase()
          .includes('la cita ha sido agendada con éxito') ||
        this.output.toLowerCase().includes('cita creada') ||
        this.output.toLowerCase().includes('la cita ha sido creada con éxito')
      ) {
        // Extraer datos de la respuesta para registrar la cita
        const doctorId = this.extractDoctorIdFromResponse(this.output);
        const time = this.extractTimeFromResponse(this.output);
        const date = this.extractDateFromResponse(this.output);
        const reason = this.extractReasonFromResponse(this.output);

        if (doctorId && time && date && reason) {
          await this.createAppointment(doctorId, date, time, reason);
        } else {
          console.log('Datos extraídos para la cita:', {
            doctorId,
            patientId: this.patientId,
            reason,
            time,
            date: new Date().toISOString().split('T')[0],
          });
          console.error('Datos insuficientes para crear la cita.');
        }
      }
    } catch (error) {
      console.error('Error occurred while fetching API response:', error);
      this.output =
        'Se produjo un error al generar la respuesta. Por favor, inténtalo de nuevo.';
    } finally {
      this.isTyping = false;
    }
  }

  async createAppointment(
    doctorId: number,
    date: string,
    time: string,
    reason: string
  ) {
    if (!this.jwt || !this.patientId || this.patientId <= 0) {
      console.error(
        'No se puede crear la cita sin la autenticación adecuada o patientId inválido.'
      );
      return;
    }

    try {
      const result = await this.apollo
        .mutate({
          mutation: REGISTER_APPOINTMENT,
          variables: {
            appointmentInput: {
              doctorId,
              patientId: this.patientId,
              reason,
              time,
              date,
            },
          },
          context: {
            headers: {
              Authorization: `Bearer ${this.jwt}`,
            },
          },
        })
        .toPromise();

      if (result?.data) {
        console.log('Cita creada con éxito:', result.data);
        alert('Cita creada con éxito.');
        this.appointmentCreated = true;
      }
    } catch (error) {
      console.error('Error al crear la cita:', error);
    }
  }

  resetAppointmentCreation() {
    window.location.reload();
  }

  extractDoctorIdFromResponse(response: string): number | null {
    // Busca el patrón "DoctorId: [Número]"
    const doctorIdRegex = /DoctorId:\s*(\d+)/i;
    const match = response.match(doctorIdRegex);
    if (!match) {
      console.warn('No se pudo encontrar un doctorId en la respuesta.');
      return null;
    }
    return parseInt(match[1], 10);
  }

  extractTimeFromResponse(response: string): string | null {
    // Busca el patrón "Hora: [HH:MM]"
    const timeRegex = /Hora:\s*(\d{2}:\d{2})/i;
    const match = response.match(timeRegex);
    if (!match) {
      console.warn('No se pudo encontrar una hora en la respuesta.');
      return null;
    }
    return match[1];
  }

  extractDateFromResponse(response: string): string | null {
    // Busca el patrón "Fecha: [AAAA-MM-DD]"
    const dateRegex = /Fecha:\s*(\d{4}-\d{2}-\d{2})/i;
    const match = response.match(dateRegex);
    return match ? match[1] : null;
  }

  extractReasonFromResponse(response: string): string | null {
    // Busca el patrón "Razón: [Texto]"
    const reasonRegex = /Razón:\s*([^\n]+)/i;
    const match = response.match(reasonRegex);
    return match ? match[1].trim() : null;
  }
}
