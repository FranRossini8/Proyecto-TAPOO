const Apuesta = require("../Models/apuestas");
const Carrera = require("../Models/carreras");
const Usuario = require("../Models/user");
const { addApuesta } = require("../Controllers/apuestas");

jest.mock("../Models/apuestas", () => {
    return jest.fn();
});

jest.mock("../Models/carreras", () => ({
    findOne: jest.fn(),
}));

jest.mock("../Models/user", () => ({
    findById: jest.fn(),
}));

describe("addApuesta", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("debería agregar una nueva apuesta correctamente", async () => {
        const usuarioId = "123";
        const nombreCaballo = "Caballo Veloz";
        const numCarrera = "1";
        const montoApostado = 100;

        Carrera.findOne.mockResolvedValue({
            fecha: new Date(Date.now() + 3600 * 1000),
        });

        const usuarioMock = {
            dinero: 500,
            apuestas: [],
            save: jest.fn().mockResolvedValue(true),
        };
        Usuario.findById.mockResolvedValue(usuarioMock);

        Apuesta.mockImplementation(function (apuestaData) {
            return {
                ...apuestaData,
                save: jest.fn().mockResolvedValue(apuestaData), // Mock del método save
            };
        });

        const result = await addApuesta(usuarioId, nombreCaballo, numCarrera, montoApostado);

        expect(Carrera.findOne).toHaveBeenCalledWith({ numCarrera: parseInt(numCarrera, 10) });
        expect(Usuario.findById).toHaveBeenCalledWith(usuarioId);
        expect(Apuesta).toHaveBeenCalledWith({
            usuarioId,
            fecha: expect.any(Date),
            nomCaballo: nombreCaballo,
            dinApostado: montoApostado,
            numCarrera,
        });
        expect(usuarioMock.save).toHaveBeenCalled();
        expect(result.apuesta).toMatchObject({
            usuarioId,
            nomCaballo: nombreCaballo,
            dinApostado: montoApostado,
            numCarrera,
        });
    });
});

