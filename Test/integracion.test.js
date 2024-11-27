const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

// Mock de modelos
jest.mock("../Models/user", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../Models/carreras", () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../Models/apuestas", () => ({
  find: jest.fn(),
  save: jest.fn(),
}));

const User = require("../Models/user");
const Carrera = require("../Models/carreras");
const Apuesta = require("../Models/apuestas");

// Datos ficticios
const mockUser = {
  _id: "user123",
  email: "test@example.com",
  nombre: "Juan",
  apellido: "Perez",
  password: "password123",
  dinero: 100,
  apuestas: [],
  save: jest.fn(),
};

const mockCarrera = {
  _id: "carrera123",
  numCarrera: 1,
  fecha: new Date(Date.now() + 1000 * 60 * 60), // Una hora en el futuro
  caballos: [
    { caballoId: "caballo1", nombre: "Relampago", cuantoPaga: 2.5 },
    { caballoId: "caballo2", nombre: "Tornado", cuantoPaga: 3.0 },
  ],
  save: jest.fn(),
};

const mockApuesta = {
  usuarioId: "user123",
  fecha: new Date(),
  nomCaballo: "Relampago",
  dinApostado: 50,
  numCarrera: 1,
  save: jest.fn(),
};

// Mock del token y configuración del servidor
const jwtSecret = "testsecret";
const app = require("../index"); 
let server;



describe("Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    server = app.listen(4000);
  });

  afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("Debería realizar todo el flujo de login, crear carrera, apostar y procesar carrera", async () => {
    // Mock de login
    const hashedPassword = await bcrypt.hash("password123", 10);
    User.findOne.mockResolvedValue({ 
        ...mockUser, 
        password:hashedPassword,  
    });

    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");
    token = loginResponse.body.token;
    expect(jwt.verify(token, jwtSecret)).toBeDefined();

    // Mock de crear carrera
    Carrera.find.mockResolvedValueOnce([]);
    Carrera.save.mockResolvedValue(mockCarrera);

    const createCarreraResponse = await request(app)
      .post("/carrera")
      .send({ fecha: mockCarrera.fecha })
      .set("Authorization", `Bearer ${token}`);

    expect(createCarreraResponse.status).toBe(200);
    expect(createCarreraResponse.body.carrera).toEqual(expect.any(Object));

    // Mock de realizar apuesta
    User.findById.mockResolvedValue(mockUser);
    Carrera.findOne.mockResolvedValue(mockCarrera);
    Apuesta.save.mockResolvedValue(mockApuesta);

    const apuestaResponse = await request(app)
      .post(`/apuesta`)
      .send({ nomCaballo: "Relampago", numCarrera: 1, montoApostado: 50 })
      .set("Authorization", `Bearer ${token}`);

    expect(apuestaResponse.status).toBe(200);
    expect(apuestaResponse.body.apuesta).toEqual(expect.any(Object));

    // Mock de procesar carrera
    Carrera.findOne.mockResolvedValue(mockCarrera);
    Apuesta.find.mockResolvedValue([mockApuesta]);
    User.findById.mockResolvedValue(mockUser);

    const procesarResponse = await request(app)
      .post(`/procesar-carrera`)
      .send({ numCarrera:mockCarrera.numCarrera});

    expect(procesarResponse.status).toBe(200);
    expect(procesarResponse.body.ganador).toBeDefined();
    expect(procesarResponse.body.ganadores).toEqual(expect.any(Array));

    // Verificar saldo actualizado
    expect(mockUser.dinero).toBeGreaterThan(100); // Asegura que se haya actualizado correctamente
  });
});