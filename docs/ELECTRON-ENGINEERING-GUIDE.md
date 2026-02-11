# CertifiKit Desktop - Software Engineering Best Practices

## 🏗️ Architecture & Design Principles

### Clean Architecture for Electron Applications

```
certifikit-desktop/
├── src/
│   ├── main/                    # Electron Main Process (Node.js)
│   │   ├── index.ts             # Entry point
│   │   ├── window-manager.ts    # Window lifecycle
│   │   ├── file-handler.ts      # File operations
│   │   ├── database/            # SQLite operations
│   │   │   ├── connection.ts
│   │   │   ├── repositories/
│   │   │   └── migrations/
│   │   ├── services/            # Business logic
│   │   │   ├── certificate-generator.service.ts
│   │   │   ├── template.service.ts
│   │   │   ├── excel-parser.service.ts
│   │   │   └── pdf-export.service.ts
│   │   └── ipc/                 # IPC handlers
│   │       ├── certificate.handlers.ts
│   │       ├── file.handlers.ts
│   │       └── settings.handlers.ts
│   │
│   ├── renderer/                # Electron Renderer Process (Browser)
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── pages/               # Route-based pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Generator.tsx
│   │   │   ├── Templates.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/          # Reusable UI components
│   │   │   ├── certificate/
│   │   │   ├── ui/
│   │   │   └── layout/
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useIPC.ts
│   │   │   ├── useFileDialog.ts
│   │   │   └── useCertificate.ts
│   │   ├── stores/              # State management (Zustand)
│   │   │   ├── certificate.store.ts
│   │   │   ├── template.store.ts
│   │   │   └── settings.store.ts
│   │   └── utils/               # Helper functions
│   │       ├── validators.ts
│   │       ├── formatters.ts
│   │       └── constants.ts
│   │
│   ├── shared/                  # Shared between Main & Renderer
│   │   ├── types/
│   │   │   ├── certificate.types.ts
│   │   │   ├── template.types.ts
│   │   │   └── ipc.types.ts
│   │   ├── constants/
│   │   └── validators/
│   │
│   └── preload/                 # Preload scripts (IPC bridge)
│       ├── index.ts
│       └── api.ts               # Exposed APIs to renderer
│
├── assets/                      # Static assets
│   ├── icons/
│   ├── templates/
│   └── fonts/
│
├── build/                       # Build resources
│   ├── icon.ico
│   └── installer.nsh
│
└── tests/                       # Test suites
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🎯 SOLID Principles for Electron

### 1. **Single Responsibility Principle (SRP)**

**❌ Bad:**
```typescript
// One class doing too much
class CertificateManager {
  parseExcel(file: File) { }
  generatePDF(data: any) { }
  sendEmail(pdf: Buffer) { }
  saveToDatabase(cert: Certificate) { }
  createQRCode(data: string) { }
}
```

**✅ Good:**
```typescript
// Separate responsibilities into focused classes
class ExcelParser {
  parse(file: File): ParsedData { }
}

class PDFGenerator {
  generate(template: Template, data: CertificateData): Buffer { }
}

class EmailService {
  send(recipient: string, attachment: Buffer): Promise<void> { }
}

class CertificateRepository {
  save(cert: Certificate): Promise<void> { }
  findById(id: string): Promise<Certificate> { }
}

class QRCodeGenerator {
  generate(url: string): Buffer { }
}
```

---

### 2. **Open/Closed Principle (OCP)**

**❌ Bad:**
```typescript
class PDFExporter {
  export(format: string) {
    if (format === 'pdf') {
      // PDF logic
    } else if (format === 'png') {
      // PNG logic
    } else if (format === 'docx') {
      // DOCX logic - requires changing existing code
    }
  }
}
```

**✅ Good:**
```typescript
// Open for extension, closed for modification
interface Exporter {
  export(data: CertificateData): Promise<Buffer>;
}

class PDFExporter implements Exporter {
  async export(data: CertificateData): Promise<Buffer> {
    // PDF-specific logic
    return pdfBuffer;
  }
}

class PNGExporter implements Exporter {
  async export(data: CertificateData): Promise<Buffer> {
    // PNG-specific logic
    return pngBuffer;
  }
}

class DOCXExporter implements Exporter {
  async export(data: CertificateData): Promise<Buffer> {
    // DOCX-specific logic (new feature, no changes to existing code)
    return docxBuffer;
  }
}

// Usage
class ExportService {
  constructor(private exporter: Exporter) {}
  
  async exportCertificate(data: CertificateData) {
    return this.exporter.export(data);
  }
}
```

---

### 3. **Liskov Substitution Principle (LSP)**

**✅ Good:**
```typescript
abstract class TemplateRenderer {
  abstract render(template: Template): Promise<HTMLCanvasElement>;
  
  validate(template: Template): boolean {
    return template.width > 0 && template.height > 0;
  }
}

class Canvas2DRenderer extends TemplateRenderer {
  async render(template: Template): Promise<HTMLCanvasElement> {
    // 2D canvas rendering
    return canvas;
  }
}

class WebGLRenderer extends TemplateRenderer {
  async render(template: Template): Promise<HTMLCanvasElement> {
    // WebGL rendering (faster for complex templates)
    return canvas;
  }
}

// Both can be used interchangeably
function generateCertificate(renderer: TemplateRenderer) {
  const canvas = await renderer.render(template);
  // Works with any renderer implementation
}
```

---

### 4. **Interface Segregation Principle (ISP)**

**❌ Bad:**
```typescript
interface CertificateOperations {
  create(): void;
  update(): void;
  delete(): void;
  export(): void;
  email(): void;
  print(): void;
  verify(): void;
}

// Read-only viewer is forced to implement unnecessary methods
class CertificateViewer implements CertificateOperations {
  create() { throw new Error('Not supported'); }
  update() { throw new Error('Not supported'); }
  delete() { throw new Error('Not supported'); }
  export() { /* OK */ }
  email() { throw new Error('Not supported'); }
  print() { /* OK */ }
  verify() { /* OK */ }
}
```

**✅ Good:**
```typescript
interface Readable {
  read(): Certificate;
}

interface Writable {
  create(cert: Certificate): void;
  update(cert: Certificate): void;
}

interface Deletable {
  delete(id: string): void;
}

interface Exportable {
  export(format: string): Buffer;
}

// Viewer only implements what it needs
class CertificateViewer implements Readable, Exportable {
  read() { return certificate; }
  export(format: string) { return buffer; }
}

// Editor implements more capabilities
class CertificateEditor implements Readable, Writable, Exportable {
  read() { return certificate; }
  create(cert: Certificate) { }
  update(cert: Certificate) { }
  export(format: string) { return buffer; }
}
```

---

### 5. **Dependency Inversion Principle (DIP)**

**❌ Bad:**
```typescript
// High-level module depends on low-level module
class CertificateService {
  private database = new SQLiteDatabase(); // Tight coupling
  
  save(cert: Certificate) {
    this.database.insert(cert); // Depends on concrete implementation
  }
}
```

**✅ Good:**
```typescript
// Both depend on abstraction
interface ICertificateRepository {
  save(cert: Certificate): Promise<void>;
  find(id: string): Promise<Certificate>;
}

class SQLiteCertificateRepository implements ICertificateRepository {
  async save(cert: Certificate) {
    // SQLite-specific implementation
  }
  async find(id: string) {
    // SQLite-specific implementation
  }
}

class CertificateService {
  constructor(private repository: ICertificateRepository) {} // Inject dependency
  
  async saveCertificate(cert: Certificate) {
    await this.repository.save(cert); // Works with any implementation
  }
}

// Easy to test with mock repository
class MockCertificateRepository implements ICertificateRepository {
  async save(cert: Certificate) { }
  async find(id: string) { return mockCert; }
}
```

---

## 💡 Additional Design Principles

### DRY (Don't Repeat Yourself)

**❌ Bad:**
```typescript
// Validation logic repeated everywhere
ipcMain.handle('create-certificate', async (event, data) => {
  if (!data.name || data.name.length < 2) {
    throw new Error('Invalid name');
  }
  if (!data.course || data.course.length < 3) {
    throw new Error('Invalid course');
  }
  // ... more validation
});

ipcMain.handle('update-certificate', async (event, data) => {
  if (!data.name || data.name.length < 2) {
    throw new Error('Invalid name');
  }
  if (!data.course || data.course.length < 3) {
    throw new Error('Invalid course');
  }
  // ... same validation again
});
```

**✅ Good:**
```typescript
// Centralized validation
class CertificateValidator {
  static validate(data: CertificateData): ValidationResult {
    const errors: string[] = [];
    
    if (!data.name || data.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    if (!data.course || data.course.length < 3) {
      errors.push('Course must be at least 3 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Use validator in IPC handlers
ipcMain.handle('create-certificate', async (event, data) => {
  const validation = CertificateValidator.validate(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }
  // ... proceed
});
```

---

### KISS (Keep It Simple, Stupid)

**❌ Bad:**
```typescript
// Over-engineered solution
class AdvancedCertificateGenerator implements IGenerator, IObservable, ISerializable {
  private strategy: IGenerationStrategy;
  private observers: IObserver[];
  private factory: AbstractCertificateFactory;
  
  generateWithStrategy(
    strategy: IGenerationStrategy,
    builder: ICertificateBuilder,
    adapter: IDataAdapter
  ): Observable<Certificate> {
    // 100+ lines of complex abstraction
  }
}
```

**✅ Good:**
```typescript
// Simple, straightforward solution
class CertificateGenerator {
  generate(template: Template, data: CertificateData): Certificate {
    const canvas = this.renderTemplate(template);
    this.fillData(canvas, data);
    return this.createCertificate(canvas);
  }
  
  private renderTemplate(template: Template): HTMLCanvasElement {
    // Simple canvas creation
  }
  
  private fillData(canvas: HTMLCanvasElement, data: CertificateData) {
    // Simple text drawing
  }
  
  private createCertificate(canvas: HTMLCanvasElement): Certificate {
    // Simple PDF creation
  }
}
```

---

### YAGNI (You Aren't Gonna Need It)

**❌ Bad:**
```typescript
// Adding features "just in case"
interface Certificate {
  id: string;
  name: string;
  course: string;
  date: Date;
  // Features we don't need yet
  blockchainHash?: string;
  nftTokenId?: string;
  aiGeneratedSummary?: string;
  socialMediaShareCount?: number;
  geoLocation?: GeoCoordinates;
}
```

**✅ Good:**
```typescript
// Only what's needed now
interface Certificate {
  id: string;
  name: string;
  course: string;
  date: Date;
  templateId: string;
  qrCode: string;
}

// Add features when actually needed, not speculatively
```

---

## 🔐 Electron-Specific Best Practices

### 1. **Context Isolation & Security**

**✅ Always enable context isolation:**
```typescript
// main/window-manager.ts
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  webPreferences: {
    nodeIntegration: false,        // CRITICAL: Disable Node in renderer
    contextIsolation: true,         // CRITICAL: Isolate contexts
    sandbox: true,                  // Enable sandboxing
    preload: path.join(__dirname, 'preload.js')
  }
});
```

**✅ Expose only necessary APIs via preload:**
```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// Whitelist of allowed IPC channels
const ALLOWED_CHANNELS = [
  'certificate:create',
  'certificate:update',
  'file:open',
  'file:save'
];

contextBridge.exposeInMainWorld('electron', {
  // Safe, controlled API exposure
  certificate: {
    create: (data: CertificateData) => 
      ipcRenderer.invoke('certificate:create', data),
    update: (id: string, data: CertificateData) => 
      ipcRenderer.invoke('certificate:update', id, data),
  },
  file: {
    openDialog: () => ipcRenderer.invoke('file:open'),
    saveDialog: (data: Buffer) => ipcRenderer.invoke('file:save', data),
  }
});

// Type definitions for renderer
declare global {
  interface Window {
    electron: {
      certificate: {
        create: (data: CertificateData) => Promise<Certificate>;
        update: (id: string, data: CertificateData) => Promise<void>;
      };
      file: {
        openDialog: () => Promise<string>;
        saveDialog: (data: Buffer) => Promise<void>;
      };
    };
  }
}
```

---

### 2. **IPC Communication Pattern**

**✅ Type-safe IPC with validation:**
```typescript
// shared/types/ipc.types.ts
export enum IPCChannel {
  CERTIFICATE_CREATE = 'certificate:create',
  CERTIFICATE_UPDATE = 'certificate:update',
  FILE_OPEN = 'file:open',
  FILE_SAVE = 'file:save',
}

export interface IPCRequest<T = unknown> {
  data: T;
  timestamp: number;
}

export interface IPCResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// main/ipc/base.handler.ts
export abstract class BaseIPCHandler<TRequest, TResponse> {
  constructor(protected channel: IPCChannel) {
    ipcMain.handle(channel, this.handle.bind(this));
  }
  
  private async handle(
    event: IpcMainInvokeEvent,
    request: IPCRequest<TRequest>
  ): Promise<IPCResponse<TResponse>> {
    try {
      const data = await this.execute(request.data);
      return { success: true, data };
    } catch (error) {
      console.error(`IPC Error [${this.channel}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  protected abstract execute(data: TRequest): Promise<TResponse>;
}

// main/ipc/certificate.handler.ts
class CreateCertificateHandler extends BaseIPCHandler<
  CertificateData,
  Certificate
> {
  constructor(private certificateService: CertificateService) {
    super(IPCChannel.CERTIFICATE_CREATE);
  }
  
  protected async execute(data: CertificateData): Promise<Certificate> {
    return this.certificateService.create(data);
  }
}
```

---

### 3. **Error Handling Strategy**

**✅ Comprehensive error handling:**
```typescript
// shared/types/errors.ts
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  GENERATION_FAILED = 'GENERATION_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// main/services/certificate-generator.service.ts
class CertificateGeneratorService {
  async generate(data: CertificateData): Promise<Certificate> {
    try {
      // Validate input
      const validation = this.validate(data);
      if (!validation.isValid) {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'Invalid certificate data',
          validation.errors
        );
      }
      
      // Generate certificate
      const cert = await this.generateInternal(data);
      return cert;
      
    } catch (error) {
      if (error instanceof AppError) {
        throw error; // Re-throw known errors
      }
      
      // Log unknown errors
      logger.error('Certificate generation failed:', error);
      
      throw new AppError(
        ErrorCode.GENERATION_FAILED,
        'Failed to generate certificate',
        error
      );
    }
  }
}

// renderer/hooks/useCertificate.ts
export function useCertificate() {
  const [error, setError] = useState<AppError | null>(null);
  
  const create = async (data: CertificateData) => {
    try {
      const response = await window.electron.certificate.create(data);
      if (!response.success) {
        setError(new AppError(
          ErrorCode.GENERATION_FAILED,
          response.error || 'Unknown error'
        ));
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err as AppError);
      return null;
    }
  };
  
  return { create, error };
}
```

---

### 4. **Performance Optimization**

**✅ Batch processing with progress tracking:**
```typescript
// main/services/batch-processor.service.ts
class BatchProcessor {
  private readonly CHUNK_SIZE = 100; // Process 100 at a time
  
  async processBatch(
    data: CertificateData[],
    onProgress: (current: number, total: number) => void
  ): Promise<Certificate[]> {
    const results: Certificate[] = [];
    const chunks = this.createChunks(data, this.CHUNK_SIZE);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Process chunk in parallel
      const chunkResults = await Promise.all(
        chunk.map(item => this.generator.generate(item))
      );
      
      results.push(...chunkResults);
      
      // Update progress
      onProgress(results.length, data.length);
      
      // Give event loop time to breathe
      await this.sleep(10);
    }
    
    return results;
  }
  
  private createChunks<T>(array: T[], size: number): T[][] {
    return Array.from(
      { length: Math.ceil(array.length / size) },
      (_, i) => array.slice(i * size, (i + 1) * size)
    );
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**✅ Memory management:**
```typescript
// main/services/pdf-export.service.ts
class PDFExportService {
  async exportBatch(certificates: Certificate[], outputDir: string) {
    for (const cert of certificates) {
      // Export one at a time to manage memory
      await this.exportSingle(cert, outputDir);
      
      // Clear canvas from memory
      cert.canvas = null;
      
      // Force garbage collection (if --expose-gc flag is set)
      if (global.gc) {
        global.gc();
      }
    }
  }
  
  private async exportSingle(cert: Certificate, dir: string) {
    const pdf = await this.generatePDF(cert);
    await fs.promises.writeFile(
      path.join(dir, `${cert.id}.pdf`),
      pdf
    );
    // PDF buffer goes out of scope and gets collected
  }
}
```

---

### 5. **Database Pattern (SQLite)**

**✅ Repository pattern with migrations:**
```typescript
// main/database/connection.ts
import Database from 'better-sqlite3';

export class DatabaseConnection {
  private static instance: Database.Database;
  
  static getInstance(): Database.Database {
    if (!this.instance) {
      const dbPath = path.join(app.getPath('userData'), 'certifikit.db');
      this.instance = new Database(dbPath);
      this.instance.pragma('journal_mode = WAL'); // Performance boost
    }
    return this.instance;
  }
}

// main/database/migrations/001_initial.ts
export const migration_001 = {
  up: (db: Database.Database) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        course TEXT NOT NULL,
        date TEXT NOT NULL,
        template_id TEXT NOT NULL,
        qr_code TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX idx_certificates_date ON certificates(date);
      CREATE INDEX idx_certificates_template ON certificates(template_id);
    `);
  },
  
  down: (db: Database.Database) => {
    db.exec('DROP TABLE IF EXISTS certificates');
  }
};

// main/database/repositories/certificate.repository.ts
export class CertificateRepository {
  private db: Database.Database;
  
  constructor() {
    this.db = DatabaseConnection.getInstance();
  }
  
  save(cert: Certificate): void {
    const stmt = this.db.prepare(`
      INSERT INTO certificates (id, name, course, date, template_id, qr_code)
      VALUES (@id, @name, @course, @date, @templateId, @qrCode)
    `);
    
    stmt.run({
      id: cert.id,
      name: cert.name,
      course: cert.course,
      date: cert.date.toISOString(),
      templateId: cert.templateId,
      qrCode: cert.qrCode
    });
  }
  
  findById(id: string): Certificate | null {
    const stmt = this.db.prepare('SELECT * FROM certificates WHERE id = ?');
    const row = stmt.get(id) as any;
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      course: row.course,
      date: new Date(row.date),
      templateId: row.template_id,
      qrCode: row.qr_code
    };
  }
  
  findAll(limit = 100, offset = 0): Certificate[] {
    const stmt = this.db.prepare(`
      SELECT * FROM certificates
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    
    return stmt.all(limit, offset).map(this.mapToCertificate);
  }
  
  private mapToCertificate(row: any): Certificate {
    return {
      id: row.id,
      name: row.name,
      course: row.course,
      date: new Date(row.date),
      templateId: row.template_id,
      qrCode: row.qr_code
    };
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/unit/services/certificate-validator.test.ts
import { describe, it, expect } from 'vitest';
import { CertificateValidator } from '@/main/services/certificate-validator';

describe('CertificateValidator', () => {
  it('should validate correct data', () => {
    const data = {
      name: 'John Doe',
      course: 'Computer Science',
      date: new Date()
    };
    
    const result = CertificateValidator.validate(data);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should reject invalid name', () => {
    const data = {
      name: 'J',
      course: 'Computer Science',
      date: new Date()
    };
    
    const result = CertificateValidator.validate(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name must be at least 2 characters');
  });
});
```

### Integration Tests

```typescript
// tests/integration/ipc/certificate.test.ts
import { app } from 'electron';
import { ipcMain } from 'electron';
import { describe, it, expect, beforeAll } from 'vitest';

describe('Certificate IPC', () => {
  beforeAll(async () => {
    await app.whenReady();
  });
  
  it('should create certificate via IPC', async () => {
    const data = {
      name: 'Jane Doe',
      course: 'Engineering',
      date: new Date()
    };
    
    const response = await ipcMain.invoke('certificate:create', data);
    
    expect(response.success).toBe(true);
    expect(response.data.id).toBeDefined();
  });
});
```

### E2E Tests with Playwright

```typescript
// tests/e2e/certificate-generation.spec.ts
import { test, expect, _electron as electron } from '@playwright/test';

test('should generate certificate', async () => {
  const app = await electron.launch({ args: ['.'] });
  const window = await app.firstWindow();
  
  // Navigate to generator page
  await window.click('text=Generator');
  
  // Fill form
  await window.fill('input[name="name"]', 'John Doe');
  await window.fill('input[name="course"]', 'Computer Science');
  
  // Click generate
  await window.click('button:has-text("Generate")');
  
  // Verify success message
  await expect(window.locator('text=Certificate generated')).toBeVisible();
  
  await app.close();
});
```

---

## 📊 Logging & Monitoring

**✅ Structured logging:**
```typescript
// main/utils/logger.ts
import winston from 'winston';
import path from 'path';
import { app } from 'electron';

const logDir = path.join(app.getPath('userData'), 'logs');

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Usage
logger.info('Certificate generated', { id: cert.id, name: cert.name });
logger.error('Generation failed', { error: err.message, stack: err.stack });
```

---

## 🔧 Development Workflow

### Git Workflow

```
main (production-ready)
  └── develop (integration branch)
       ├── feature/batch-processing
       ├── feature/qr-verification
       └── bugfix/excel-parsing
```

### Commit Messages

```bash
# Format: type(scope): description

feat(generator): add batch processing for 1000+ certificates
fix(excel): handle empty cells in roster
docs(readme): add installation instructions
test(certificate): add unit tests for validator
perf(pdf): optimize memory usage for large batches
refactor(ipc): extract handlers into separate files
```

### Code Review Checklist

- [ ] Follows SOLID principles
- [ ] No hardcoded values (use constants)
- [ ] Error handling implemented
- [ ] Unit tests added
- [ ] TypeScript types defined
- [ ] No console.log (use logger)
- [ ] Security best practices followed
- [ ] Performance optimized
- [ ] Documentation updated

---

## 📦 Build & Distribution

**electron-builder configuration:**
```json
{
  "build": {
    "appId": "com.umak.certifikit",
    "productName": "CertifiKit Desktop",
    "directories": {
      "output": "dist"
    },
    "files": [
      "dist-electron/**/*",
      "dist-renderer/**/*",
      "assets/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico",
      "certificateFile": "certs/cert.pfx",
      "certificatePassword": "${process.env.CERT_PASSWORD}"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "CertifiKit"
    },
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "certifikit-desktop"
    }
  }
}
```

---

## 🚀 Performance Benchmarks

Target metrics:
- **Cold start:** < 3 seconds
- **Certificate generation:** 100 certs in < 30 seconds
- **Memory usage:** < 500MB for 1000 certs
- **Database query:** < 50ms for 1000 records
- **File operations:** < 100ms per file

---

## 🔒 Security Checklist

- [ ] Context isolation enabled
- [ ] Node integration disabled in renderer
- [ ] Validate all user inputs
- [ ] Sanitize file paths
- [ ] Use parameterized SQL queries
- [ ] Don't store sensitive data in plain text
- [ ] Enable code signing
- [ ] Use HTTPS for external requests
- [ ] Implement content security policy
- [ ] Regular dependency updates

---

**Last Updated:** January 18, 2026  
**Status:** Reference Guide  
**Target Audience:** First-time Electron developers
