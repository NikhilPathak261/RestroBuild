FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd --system restrobuild && useradd --system --gid restrobuild restrobuild
RUN mkdir -p /app/uploads/media && chown -R restrobuild:restrobuild /app/uploads
COPY --from=build --chown=restrobuild:restrobuild /app/target/restrobuild-backend-0.0.1-SNAPSHOT.jar app.jar
USER restrobuild
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:8080/api/health/ready || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
