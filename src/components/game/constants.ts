export const SHIP_SIZE = 56;
export const SHIP_SPEED = 450;
export const BULLET_SPEED = 700;
export const BULLET_INTERVAL = 110;
export const HELPER_FIRE_INTERVAL = 170;
export const ENEMY_BULLET_SPEED = 270;
export const SPAWN_INTERVAL = 550;
export const BASE_ACTIVE_TARGETS = 16;
export const MAX_ACTIVE_TARGETS = 32;
export const INTRO_DURATION = 4500;
export const OUTRO_DURATION = 9500;
export const DEATH_EXPLOSION_DURATION = 2800;
export const DEATH_PROMPT_TIME = 14000;
export const DEATH_ACCEPT_DURATION = 2500;
export const HIT_INVINCIBILITY = 1500;
export const SHIP_HIT_RADIUS = SHIP_SIZE / 2 - 4;
export const HELPER_HIT_RADIUS = 28;
export const MAX_LIVES = 3;

export const PALETTE = {
  heading: '#C4A2D4',
  company: '#6EC4B8',
  project: '#B0BCE8',
  skill: '#82C8A0',
  name: '#F3BDCA',
  enemyBullet: '#E27878',
  helper: '#6EC4B8',
};

export const RESCUE_NAMES = [
  // The Nier: Automata Core
  '2B_backup_07', '9S_recovery', 'A2_override', 'Pod_042', 'Pod_153',
  'Operator_6O', 'Commander_White', 'Emil_♪', 'Devola', 'Popola',

  // The "Vibecoding" & Modern AI Era
  'vibecoding_expert', 'cursor_take_the_wheel', 'chatgpt_wrote_this_func',
  'claude_save_me', 'manifesting_zero_bugs', 'astrology_driven_dev',
  'hope_driven_development', 'prompt_injection_survivor', 'wrapper_startup_founder',

  // Gen Z Dev Slang
  'git_commit_-m_"fixed_vibes"', 'let_him_cook', 'skill_issue_detected',
  'testing_in_prod_fr_fr', 'LGTM_no_cap', 'delulu_in_production',

  // The Cloud & Backend Trenches
  'k8s_CrashLoopBackOff', 'grpc_deadline_exceeded', 'aws_billing_alert',
  'yaml_indentation_error', '502_bad_gateway', 'dropped_production_db',
  'localhost:3000', 'it_was_a_dns_issue',

  // Frontend & React Pain
  'useEffect_infinite_loop', 'hydration_mismatch', 'node_modules_black_hole',
  'undefined_is_not_a_function', 'cors_policy_blocked', 'prop_drilling_champ',

  // Classic Developer Memes & Terminal Trauma
  'git_push_--force', 'rm_-rf_/production', 'sudo_make_sandwich',
  'null_pointer_exception', 'merge_conflict_survivor', 'chmod_777',
  'stack_overflow', '404_not_found', 'git_blame', 'async_await_forever',
  'segfault_core_dumped', 'works_on_my_machine', 'exited_vim_successfully'
];

export const HELPER_COLORS = ['#6EC4B8', '#B0BCE8', '#82C8A0', '#E8C97E', '#75D6F6', '#F3BDCA', '#C4A2D4', '#DDA05C'];
