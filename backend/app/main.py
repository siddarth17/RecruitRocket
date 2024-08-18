from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, user, dashboard, events
from app.database import client
from app.graphql_app import graphql_app  
from dotenv import load_dotenv
from app.graphql_app import schema
from strawberry.fastapi import GraphQLRouter

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(user.router, prefix="/user")
app.include_router(dashboard.router, prefix="/user", tags=["dashboard"])
app.include_router(events.router, prefix="/events", tags=["events"])

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

@app.on_event("startup")
async def startup_db_client():
    await client.start_session()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.get("/")
async def root():
    return {"message": "Welcome to the Recruit-Rocket application"}