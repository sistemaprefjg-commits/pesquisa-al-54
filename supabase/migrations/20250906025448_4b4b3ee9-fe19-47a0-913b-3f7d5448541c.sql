-- Enable realtime for survey_responses table
ALTER TABLE public.survey_responses REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.survey_responses;