import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Hand, ArrowUp, Scissors } from 'lucide-react';
import { sfx } from '@/utils/sfx';

/**
 * 出血/烧烫伤系列关卡专属玩法集
 *  - PressHoldGame   ：持续按压伤口（用于"加压止血"/"直接加压"，不能松手）
 *  - PinchNos