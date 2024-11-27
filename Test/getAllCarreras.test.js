const Carreras = require('../Models/carreras'); 
const { getAllCarreras } = require('../Controllers/carreras'); 

jest.mock('../Models/carreras'); // Mockea el modelo Carreras

describe('getAllCarreras', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpia los mocks antes de cada test
    });

    it('debería devolver todas las carreras con límite y offset', async () => {
        // Datos de prueba
        const carrerasMock = [
            { id: 1, nombre: 'Carrera 1' },
            { id: 2, nombre: 'Carrera 2' }
        ];

        // Mock encadenado
        const mockQuery = {
            limit: jest.fn().mockReturnThis(),
            skip: jest.fn().mockResolvedValue(carrerasMock)
        };

        Carreras.find.mockReturnValue(mockQuery);

        // Llamada al método
        const limit = 2;
        const offset = 0;
        const carreras = await getAllCarreras(limit, offset);

        // Verificaciones
        expect(Carreras.find).toHaveBeenCalledWith({});
        expect(mockQuery.limit).toHaveBeenCalledWith(limit);
        expect(mockQuery.skip).toHaveBeenCalledWith(offset);
        expect(carreras).toEqual(carrerasMock);
    });
});


