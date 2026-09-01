# Aportvest

Sistema para gerenciamento de aportes e investimentos financeiros.

## Tecnologias

- Java 17
- Spring Boot 3.3.2
- Spring Data JPA
- MySQL
- Lombok
- Bean Validation

## Tipos de Investimento Suportados

- IPCA+ (Tesouro IPCA+)
- Ações
- FIIs (Fundos Imobiliários)
- Criptomoedas
- Renda Fixa
- Tesouro Selic
- Tesouro Prefixado
- CDB
- LCI / LCA
- ETFs
- BDRs

## Como Rodar

1. Certifique-se de ter o MySQL rodando na porta `3306`
2. Ajuste o usuário e senha no `application.properties` se necessário
3. Execute a aplicação:

```bash
./mvnw spring-boot:run
```

O banco `aportvest` será criado automaticamente.

## Endpoints

| Método | Endpoint                          | Descrição                    |
|--------|-----------------------------------|------------------------------|
| GET    | `/api/aportes`                    | Listar todos os aportes      |
| GET    | `/api/aportes/{id}`               | Buscar aporte por ID         |
| GET    | `/api/aportes/tipo/{tipo}`        | Filtrar por tipo             |
| GET    | `/api/aportes/corretora/{nome}`   | Filtrar por corretora        |
| GET    | `/api/aportes/periodo?inicio=&fim=` | Filtrar por período        |
| GET    | `/api/aportes/busca?nome=`        | Buscar por nome              |
| POST   | `/api/aportes`                    | Criar novo aporte            |
| PUT    | `/api/aportes/{id}`               | Atualizar aporte             |
| DELETE | `/api/aportes/{id}`               | Deletar aporte               |

## Exemplo de JSON (POST/PUT)

```json
{
  "nome": "Tesouro IPCA+ 2035",
  "tipo": "IPCA_PLUS",
  "valorAportado": 1000.00,
  "valorAtual": 1050.00,
  "quantidade": 1.0,
  "precoUnitario": 1000.00,
  "dataAporte": "2025-08-24",
  "corretora": "XP Investimentos",
  "observacao": "Primeiro aporte em IPCA+"
}
```
