const Carreras = require('../Models/carreras'); 
const Apuesta = require('../Models/apuestas'); 
const Usuario = require('../Models/user'); 
const { procesarCarrera } = require('../Controllers/carreras'); 

jest.mock('../Models/carreras');
jest.mock('../Models/apuestas');
jest.mock('../Models/user');

describe('procesarCarrera', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería lanzar un error si la carrera no existe', async () => {
        Carreras.findOne.mockResolvedValue(null);

        await expect(procesarCarrera(1)).rejects.toThrow("Carrera no encontrada");
        expect(Carreras.findOne).toHaveBeenCalledWith({ numCarrera: 1 });
    });

    it('debería lanzar un error si la carrera no ha finalizado', async () => {
        Carreras.findOne.mockResolvedValue({
            fecha: new Date(Date.now() + 10000), // Fecha futura
            caballos: [],
        });

        await expect(procesarCarrera(1)).rejects.toThrow("La carrera no ha finalizado aún");
    });

    it('debería lanzar un error si no hay caballos registrados', async () => {
        Carreras.findOne.mockResolvedValue({
            fecha: new Date(Date.now() - 10000), // Fecha pasada
            caballos: [],
        });

        await expect(procesarCarrera(1)).rejects.toThrow("No hay caballos registrados para esta carrera");
    });

    it('debería devolver "Sin apuestas" si no hay apuestas registradas', async () => {
        Carreras.findOne.mockResolvedValue({
            fecha: new Date(Date.now() - 10000), // Fecha pasada
            caballos: [{ nombre: 'Caballo 1', cuantoPaga: 2 }],
        });

        Apuesta.find.mockResolvedValue([]);

        const result = await procesarCarrera(1);

        expect(result).toEqual({ ganador: 'Caballo 1', mensaje: 'Sin apuestas' });
    });

    it('debería procesar los pagos correctamente y devolver los ganadores', async () => {
        const caballoGanador = { nombre: 'Caballo 1', cuantoPaga: 2 };
        const apuestasMock = [
            { nomCaballo: 'Caballo 1', dinApostado: 100, usuarioId: 'user1', _id: 'apuesta1' },
            { nomCaballo: 'Caballo 2', dinApostado: 50, usuarioId: 'user2', _id: 'apuesta2' },
        ];
        const usuarioMock = {
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@test.com',
            dinero: 0,
            save: jest.fn(),
        };

        Carreras.findOne.mockResolvedValue({
            fecha: new Date(Date.now() - 10000), // Fecha pasada
            caballos: [caballoGanador],
        });

        Apuesta.find.mockResolvedValue(apuestasMock);
        Usuario.findById.mockResolvedValueOnce(usuarioMock).mockResolvedValue(null);

        const result = await procesarCarrera(1);

        expect(result.ganador).toBe('Caballo 1');
        expect(result.ganadores).toEqual([
            {
                usuario: 'Juan Pérez (juan@test.com)',
                apuesta: 100,
                pago: '200.00',
            },
        ]);
        expect(usuarioMock.save).toHaveBeenCalled();
    });

    it('debería devolver "Sin ganadores" si nadie apostó al caballo ganador', async () => {
        Carreras.findOne.mockResolvedValue({
            fecha: new Date(Date.now() - 10000), // Fecha pasada
            caballos: [{ nombre: 'Caballo 1', cuantoPaga: 2 }],
        });

        Apuesta.find.mockResolvedValue([
            { nomCaballo: 'Caballo 2', dinApostado: 100, usuarioId: 'user1', _id: 'apuesta1' },
        ]);

        const result = await procesarCarrera(1);

        expect(result).toEqual({ ganador: 'Caballo 1', mensaje: 'Sin ganadores' });
    });
});
