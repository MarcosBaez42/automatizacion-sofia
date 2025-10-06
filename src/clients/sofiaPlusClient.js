import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { cfg } from '../config.js';

export class SofiaPlusClient {
  constructor({ headless, slowMo } = {}) {
    this.headless =
      headless ?? (process.env.HEADLESS ? process.env.HEADLESS === 'true' : false);
    this.slowMo = slowMo ?? (process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 100);
    this.browser = null;
    this.page = null;
  }

  async login() {
    this.browser = await chromium.launch({ headless: this.headless, slowMo: this.slowMo });
    this.page = await this.browser.newPage();

    await this.page.goto('http://senasofiaplus.edu.co/sofia-public/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForSelector('#registradoBox1', { timeout: 60000 });

    const iframeHandle = await this.page.$('#registradoBox1');
    if (!iframeHandle) {
      throw new Error(
        'No se encontró el iframe de inicio de sesión (#registradoBox1); verifique que la página cargó correctamente.'
      );
    }
    const loginFrame = await iframeHandle.contentFrame();
    await loginFrame.waitForSelector('input#username');
    await loginFrame.getByRole('textbox', { name: 'Número de Documento' }).fill(cfg.sofiaUser);
    await loginFrame.getByRole('textbox', { name: 'Contraseña' }).fill(cfg.sofiaPass);
    await loginFrame.getByRole('button', { name: 'Ingresar' }).click();

    const ROLE_SELECT = '#seleccionRol\\:roles';
    await this.page.waitForSelector(ROLE_SELECT, { timeout: 60000 });
    await this.page.selectOption(ROLE_SELECT, { label: 'Gestión Desarrollo Curricular' });

    await this.page.waitForSelector('#side-menu, #menu_lateral', { timeout: 60000 });
    await this.page.getByRole('link', { name: 'Ejecución de la Formación' }).click();
    await this.page.getByRole('link', { name: 'Administrar Ruta de Aprendizaje' }).click();
    await this.page.getByRole('link', { name: 'Reportes ', exact: true }).click();
    await this.page.getByRole('link', { name: 'Reporte de Juicios de Evaluación', exact: true }).first().click();

    await this.page.waitForSelector('iframe#contenido', { timeout: 60000 });
  }

  async downloadReport(codigoFicha) {
    if (!this.page) {
      throw new Error('El cliente de Sofía Plus no ha iniciado sesión.');
    }

    try {
      const contenidoHandle = await this.page.waitForSelector('iframe#contenido', { timeout: 60000 });
      let frame = await contenidoHandle.contentFrame();

      await frame.getByRole('link', { name: 'Buscar Ficha de Caracterización' }).click();

      const modalHandle = await frame.waitForSelector('iframe#modalDialogContentviewDialog2', { timeout: 60000 });
      const modalFrame = await modalHandle.contentFrame();
      await modalFrame.waitForSelector('input[id$="codigoFichaITX"]', { timeout: 60000 });

      await modalFrame.fill('input[id$="codigoFichaITX"]', String(codigoFicha));
      await modalFrame.getByRole('button', { name: 'Consultar' }).click();
      await modalFrame.waitForSelector('table[id$="dtFichas"] tbody tr');
      const firstRow = modalFrame.locator('table[id$="dtFichas"] tbody tr').first();
      await firstRow.locator('button, a').first().click();

      try {
        await frame.waitForLoadState('domcontentloaded');
      } catch {
        const recapture = await this.page.waitForSelector('iframe#contenido', { timeout: 60000 });
        frame = await recapture.contentFrame();
      }
      await frame.waitForSelector('input#frmForma1\\:btnConsultar');

      const [download] = await Promise.all([
        this.page.waitForEvent('download'),
        frame.getByRole('button', { name: 'Generar Reporte' }).click()
      ]);

      const suggested = await download.suggestedFilename();
      const ext = path.extname(suggested);
      const base = path.basename(suggested, ext);
      const finalName = `${base} ${codigoFicha}${ext}`;
      console.log(`Archivo sugerido por Sofía Plus para la ficha ${codigoFicha}: ${finalName}`);

      const filePath = path.join(cfg.outputDir, finalName);
      await fs.mkdir(cfg.outputDir, { recursive: true });
      await download.saveAs(filePath);

      return filePath;
    } catch (error) {
      console.error(
        `Error al descargar el reporte de juicios de evaluación para la ficha ${codigoFicha}:`,
        error
      );
      throw new Error(
        `Fallo al descargar el reporte de juicios de evaluación para la ficha ${codigoFicha}: ${error.message}`,
        { cause: error }
      );
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

export default SofiaPlusClient;