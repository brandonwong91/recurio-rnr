
CREATE TABLE "public"."workouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"()
);

ALTER TABLE "public"."workouts" OWNER TO "postgres";

CREATE TABLE "public"."exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"()
);

ALTER TABLE "public"."exercises" OWNER TO "postgres";

CREATE TABLE "public"."workout_exercises" (
    "workout_id" "uuid" NOT NULL,
    "exercise_id" "uuid" NOT NULL
);

ALTER TABLE "public"."workout_exercises" OWNER TO "postgres";

CREATE TABLE "public"."workout_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workout_id" "uuid" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ended_at" timestamp with time zone,
    "user_id" "uuid" DEFAULT "auth"."uid"()
);

ALTER TABLE "public"."workout_sessions" OWNER TO "postgres";

CREATE TABLE "public"."workout_sets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "exercise_id" "uuid" NOT NULL,
    "reps" integer NOT NULL,
    "weight" real,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."workout_sets" OWNER TO "postgres";

ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("workout_id", "exercise_id");

ALTER TABLE ONLY "public"."workout_sessions"
    ADD CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."workout_sets"
    ADD CONSTRAINT "workout_sets_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."workouts"
    ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."exercises"
    ADD CONSTRAINT "exercises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE CASCADE;

ALTER TABLE "public"."workout_exercises"
    ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;

ALTER TABLE "public"."workout_sessions"
    ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."workout_sessions"
    ADD CONSTRAINT "workout_sessions_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE CASCADE;

ALTER TABLE "public"."workout_sets"
    ADD CONSTRAINT "workout_sets_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE CASCADE;

ALTER TABLE "public"."workout_sets"
    ADD CONSTRAINT "workout_sets_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;

GRANT ALL ON TABLE "public"."workouts" TO "anon";
GRANT ALL ON TABLE "public"."workouts" TO "authenticated";
GRANT ALL ON TABLE "public"."workouts" TO "service_role";

GRANT ALL ON TABLE "public"."exercises" TO "anon";
GRANT ALL ON TABLE "public"."exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."exercises" TO "service_role";

GRANT ALL ON TABLE "public"."workout_exercises" TO "anon";
GRANT ALL ON TABLE "public"."workout_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_exercises" TO "service_role";

GRANT ALL ON TABLE "public"."workout_sessions" TO "anon";
GRANT ALL ON TABLE "public"."workout_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_sessions" TO "service_role";

GRANT ALL ON TABLE "public"."workout_sets" TO "anon";
GRANT ALL ON TABLE "public"."workout_sets" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_sets" TO "service_role";
